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

    // Optional: notify when a user disconnects
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id} (userId: ${userId ?? "unknown"})`);
    });
  });
}

module.exports = { setupSocket };
