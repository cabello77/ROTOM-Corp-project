const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET /api/dm/conversation?userId=X&friendId=Y
 * Returns the existing DM conversation or creates one
 */
router.get("/conversation", async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    const friendId = Number(req.query.friendId);

    if (!userId || !friendId) {
      return res.status(400).json({ error: "Missing userId or friendId" });
    }

    // Check for existing DM conversation (user1Id/user2Id order doesn't matter)
    let convo = await prisma.directMessage.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId }
        ],
      },
    });

    // If no conversation exists, create it
    if (!convo) {
      convo = await prisma.directMessage.create({
        data: {
          user1Id: userId,
          user2Id: friendId,
        },
      });
    }

    res.json({ conversationId: convo.id });

  } catch (err) {
    console.error("Error loading DM conversation:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET DM message history
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const messages = await prisma.dMMessage.findMany({
      where: {
        convoId: conversationId
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: { select: { profilePicture: true } }
          }
        }
      }
    });

    res.json(messages);
  } catch (err) {
    console.error("Error loading DM messages:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

module.exports = router;
