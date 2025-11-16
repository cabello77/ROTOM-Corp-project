// backend/socket.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Initializes all Socket.IO real-time handlers.
 * Called from server.js after the IO server is created.
 */
function setupSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
      ? Number(socket.handshake.query.userId)
      : null;

    console.log(`🔌 Socket connected: ${socket.id} (userId: ${userId ?? "unknown"})`);

    // When a user joins a club room
    socket.on("joinClub", async ({ clubId }) => {
      if (!clubId || !userId) return;
      const room = `club_${clubId}`;
      socket.join(room);
      console.log(`👥 User ${userId} joined room ${room}`);

      // Optional: announce join
      socket.to(room).emit("systemMessage", {
        type: "join",
        message: `User ${userId} joined the chat.`,
        timestamp: new Date(),
      });
    });

    // Handle new chat messages
    socket.on("sendMessage", async ({ clubId, content }, ack) => {
      try {
        if (!clubId || !userId || !content) {
          if (ack) ack({ ok: false, error: "Missing required fields" });
          return;
        }

        // Save to DB
        const message = await prisma.message.create({
          data: {
            content,
            userId,
            clubId,
          },
          include: {
            user: { select: { id: true, name: true } },
          },
        });

        const room = `club_${clubId}`;
        io.to(room).emit("newMessage", message); // broadcast to all members

        if (ack) ack({ ok: true });
      } catch (error) {
        console.error("❌ Error sending message:", error);
        if (ack) ack({ ok: false, error: error.message });
      }
    });

    /* ----------------------------------
      DM — Join a DM conversation
----------------------------------- */
socket.on("join_dm", ({ conversationId }) => {
  if (!conversationId) return;

  socket.join(`dm_${conversationId}`);
  console.log(`User ${userId} joined DM room dm_${conversationId}`);
});

/* ----------------------------------
      DM — Send a Direct Message
----------------------------------- */
socket.on(
  "send_dm",
  async ({ conversationId, senderId, content }, ack) => {
    try {
      if (!conversationId || !senderId || !content) {
        if (ack) ack({ ok: false, error: "Missing required fields" });
        return;
      }

      console.log("📩 Incoming DM:", {
        conversationId,
        senderId,
        content,
      });

      // make sure conversation exists
      const convo = await prisma.directMessage.findUnique({
        where: { id: conversationId },
      });

      if (!convo) {
        console.error("❌ No conversation found:", conversationId);
        if (ack) ack({ ok: false, error: "Conversation not found" });
        return;
      }

      // determine receiver
      const receiverId =
        convo.user1Id === senderId ? convo.user2Id : convo.user1Id;

      // make sure users are friends
      const areFriends = await prisma.friend.findFirst({
        where: {
          status: "ACCEPTED",
          OR: [
            { userID: senderId, friendID: receiverId },
            { userID: receiverId, friendID: senderId },
          ],
        },
      });

      if (!areFriends) {
        console.warn(
          `🚫 User ${senderId} tried to DM non-friend ${receiverId}`
        );
        if (ack) ack({ ok: false, error: "Not friends" });
        return;
      }

      // save the DM in the database
      const message = await prisma.dMMessage.create({
        data: {
          content,
          convoId: conversationId,
          senderId,
          receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profile: { select: { profilePicture: true } },
            },
          },
        },
      });

      // broadcast message to DM room
      io.to(`dm_${conversationId}`).emit("receive_dm", message);

      console.log(`📨 DM delivered in ${conversationId}`);
      if (ack) ack({ ok: true, message });
    } catch (err) {
      console.error("🔥 Error sending DM:", err);
      if (ack) ack({ ok: false, error: "Server error" });
    }
  }
);

    // Optional: notify when a user disconnects
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id} (userId: ${userId ?? "unknown"})`);
    });
  });
}

module.exports = { setupSocket };
