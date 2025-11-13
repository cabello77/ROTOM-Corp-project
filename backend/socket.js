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
        console.error("Error sending message:", error);
        if (ack) ack({ ok: false, error: error.message });
      }
    });


//joining DM
socket.on("join_dm", (conversationId) => {
  if (!conversationId) return;
  socket.join(`dm_${conversationId}`);
  console.log(`User ${userId} joined DM room ${conversationId}`);
});

//sending DM
socket.on("send_dm", async ({ conversationId, senderId, receiverId, content }) => {
  try {
    if (!senderId || !receiverId || !content) {
      console.warn("Invalid DM payload", { conversationId, senderId, receiverId, content });
      return;
    }

    // Ensure friendship exists
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
      console.warn(`User ${senderId} tried to DM non-friend ${receiverId}`);
      return;
    }

    let convo = null;
    if (conversationId) {
      convo = await prisma.directMessage.findUnique({ where: { id: Number(conversationId) } });
    }

    if (!convo) {
      const [a, b] = senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];
      convo = await prisma.directMessage.upsert({
        where: { user1Id_user2Id: { user1Id: a, user2Id: b } },
        update: {},
        create: { user1Id: a, user2Id: b },
      });
    }

    const message = await prisma.dMMessage.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: convo.id } },
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

    socket.join(`dm_${convo.id}`);
    io.to(`dm_${convo.id}`).emit("receive_dm", message);

    console.log(`DM sent in conversation ${convo.id}`);
  } catch (err) {
    console.error("Error sending DM:", err);
  }
});

    // Optional: notify when a user disconnects
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} (userId: ${userId ?? "unknown"})`);
    });
  });
}

module.exports = { setupSocket };
