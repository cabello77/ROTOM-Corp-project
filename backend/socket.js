// backend/socket.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function setupSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
      ? Number(socket.handshake.query.userId)
      : null;

    console.log(`🔌 Socket connected: ${socket.id} (userId: ${userId ?? "unknown"})`);

    /* -----------------------------
       CLUB CHAT — join room
    ----------------------------- */
    socket.on("joinClub", async ({ clubId }) => {
      if (!clubId || !userId) return;
      const room = `club_${clubId}`;
      socket.join(room);

      console.log(`👥 User ${userId} joined room ${room}`);

      socket.to(room).emit("systemMessage", {
        type: "join",
        message: `User ${userId} joined the chat.`,
        timestamp: new Date(),
      });
    });

    /* -----------------------------
       CLUB CHAT — send message
    ----------------------------- */
    socket.on("sendMessage", async ({ clubId, content }, ack) => {
      try {
        if (!clubId || !userId || !content) {
          return ack?.({ ok: false, error: "Missing fields" });
        }

        const saved = await prisma.message.create({
          data: { content, userId, clubId },
          include: {
            user: { select: { id: true, name: true } },
          },
        });

        io.to(`club_${clubId}`).emit("newMessage", saved);
        ack?.({ ok: true });
      } catch (error) {
        console.error("Error sending message:", error);
        ack?.({ ok: false, error: error.message });
      }
    });

    /* -----------------------------
       DM — Join DM room
    ----------------------------- */
    socket.on("join_dm", (conversationId) => {
      if (!conversationId) return;
      socket.join(`dm_${conversationId}`);
      console.log(`User ${userId} joined DM room dm_${conversationId}`);
    });

    /* -----------------------------
       DM — Send DM
    ----------------------------- */
    socket.on("send_dm", async ({ conversationId, senderId, content }) => {
      try {
        if (!conversationId || !senderId || !content) {
          console.warn("Invalid DM payload", { conversationId, senderId, content });
          return;
        }

        console.log("📩 Incoming DM:", { conversationId, senderId, content });

        // Load the conversation
        let convo = await prisma.directMessage.findUnique({
          where: { id: conversationId },
        });

        if (!convo) {
          console.error("❌ No conversation found:", conversationId);
          return;
        }

        // Determine receiver
        const receiverId =
          convo.user1Id === senderId ? convo.user2Id : convo.user1Id;

        // Validate friendship
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
          console.warn(`🚫 User ${senderId} attempted DM to non-friend ${receiverId}`);
          return;
        }

        // Save DM
        const message = await prisma.dMMessage.create({
          data: {
            content,
            senderId,
            receiverId,
            convoId: conversationId,
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

        // Broadcast
        io.to(`dm_${conversationId}`).emit("receive_dm", message);

        console.log(`📨 DM delivered in ${conversationId}`);
      } catch (err) {
        console.error("🔥 Error sending DM:", err);
      }
    });

    /* -----------------------------
       DISCONNECT
    ----------------------------- */
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} (userId: ${userId ?? "unknown"})`);
    });
  });
}

module.exports = { setupSocket };
