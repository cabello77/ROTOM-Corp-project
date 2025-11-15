const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Your auth middleware - adjust based on your setup
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    // Decode JWT and get user
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function
function generateConvoId(userId1, userId2) {
  const [smaller, larger] = [userId1, userId2].sort((a, b) => a - b);
  return `dm_${smaller}_${larger}`;
}

// GET user's conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await prisma.directMessage.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                profilePicture: true
              }
            }
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                profilePicture: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    const formatted = conversations.map(conv => ({
      ...conv,
      lastMessage: conv.messages[0] || null
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// GET messages for a conversation
router.get('/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    const conversation = await prisma.directMessage.findUnique({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const messages = await prisma.dMMessage.findMany({
      where: { convoId: conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                profilePicture: true
              }
            }
          }
        }
      }
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// POST - Create or get conversation
router.post('/start', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;
    
    if (!friendId) {
      return res.status(400).json({ error: 'friendId is required' });
    }
    
    const conversationId = generateConvoId(userId, friendId);
    
    let conversation = await prisma.directMessage.findUnique({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      conversation = await prisma.directMessage.create({
        data: {
          id: conversationId,
          user1Id: Math.min(userId, friendId),
          user2Id: Math.max(userId, friendId)
        }
      });
    }
    
    res.json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

module.exports = router;