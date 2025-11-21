// backend/socket.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Helper to format club room name
 */
function clubRoom(clubId) {
  return `club:${clubId}`;
}

/**
 * Check if a user is a member of a club
 */
async function isClubMember(clubId, userId) {
  if (!clubId || !userId) return false;

  const member = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
  });

  return !!member;
}

/**
 * Initializes all Socket.IO real-time handlers.
 * Called from server.js after the IO server is created.
 */
function setupSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
      ? Number(socket.handshake.query.userId)
      : null;

    console.log(`Socket connected: ${socket.id} (userId: ${userId ?? "unknown"})`);

    /* ----------------------------------
       Join club chat room
    ----------------------------------- */
    socket.on("joinClub", async ({ clubId }) => {
      try {
        const cId = Number(clubId);
        if (!cId || !userId) return;

        const isMember = await isClubMember(cId, userId);
        if (!isMember) {
          console.warn(`User ${userId} tried joining club ${cId} but is not a member`);
          return;
        }

        socket.join(clubRoom(cId));
        console.log(`User ${userId} joined room ${clubRoom(cId)}`);
      } catch (err) {
        console.error("Error joining club room:", err);
      }
    });

    /* ----------------------------------
       Send club message
    ----------------------------------- */
    socket.on("sendMessage", async ({ clubId, content }, ack) => {
      try {
        const cId = Number(clubId);
        const text = (content || "").trim();

        if (!cId || !userId || !text) {
          return ack?.({ ok: false, error: "Invalid club message data" });
        }

        const isMember = await isClubMember(cId, userId);
        if (!isMember) {
          return ack?.({ ok: false, error: "Not a member of this club" });
        }

        const saved = await prisma.message.create({
          data: {
            content: text.slice(0, 2000),
            userId,
            clubId: cId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile: { select: { profilePicture: true } },
              },
            },
          },
        });

        const baseUrl =
          process.env.BASE_URL || "http://localhost:3001";

        const message = {
          id: saved.id,
          clubId: saved.clubId,
          content: saved.content,
          createdAt: saved.createdAt,
          user: {
            id: saved.user.id,
            name: saved.user.name,
            profilePicture: saved.user.profile?.profilePicture
              ? `${baseUrl}${saved.user.profile.profilePicture.startsWith("/") ? "" : "/"}${saved.user.profile.profilePicture}`
              : null,
          },
        };

        io.to(clubRoom(cId)).emit("newMessage", message);

        ack?.({ ok: true, message });
      } catch (error) {
        console.error("Error sending club message:", error);
        ack?.({ ok: false, error: "Failed to send message" });
      }
    });

    /* ----------------------------------
       Join DM conversation
    ----------------------------------- */
    socket.on("join_dm", ({ conversationId }) => {
      if (!conversationId) return;

      socket.join(`dm_${conversationId}`);
      console.log(`User ${userId} joined DM room dm_${conversationId}`);
    });

    /* ----------------------------------
       Send Direct Message
    ----------------------------------- */
    socket.on("send_dm", async ({ conversationId, senderId, content }, ack) => {
      try {
        if (!conversationId || !senderId || !content) {
          return ack?.({ ok: false, error: "Invalid DM payload" });
        }

        const convo = await prisma.directMessage.findUnique({
          where: { id: conversationId },
        });

        if (!convo) {
          return ack?.({ ok: false, error: "Conversation not found" });
        }

        const receiverId =
          convo.user1Id === senderId ? convo.user2Id : convo.user1Id;

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
          return ack?.({ ok: false, error: "Users are not friends" });
        }

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

        io.to(`dm_${conversationId}`).emit("receive_dm", message);

        ack?.({ ok: true, message });
      } catch (err) {
        console.error("Error sending DM:", err);
        ack?.({ ok: false, error: "Server error sending DM" });
      }
    });

    /* ----------------------------------
       Disconnect
    ----------------------------------- */
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} (userId: ${userId ?? "unknown"})`);
    });
  });
}

module.exports = { setupSocket };
