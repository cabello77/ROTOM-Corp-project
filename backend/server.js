require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const parseUserId = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error('Invalid user id');
  }
  return parsed;
};

const randomUsername = () => {
  const base = Date.now() + Math.floor(Math.random() * 1000);
  return `user_${base}`;
};

const serializeUser = (user) => {
  if (!user) return null;
  const profile = user.profile || null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullName,
          profilePicture: profile.profilePicture,
          bio: profile.bio,
          joinDate: profile.joinDate,
        }
      : null,
  };
};

// File upload handling for avatars (optional if multer is available)
let upload = null;
(() => {
  try {
    const multer = require('multer');
    const fs = require('fs');
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      }
    });
    upload = multer({
      storage,
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png/;
        const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
        if (ok) cb(null, true);
        else cb(new Error('Only JPG/PNG images are allowed'));
      }
    });
  } catch (error) {
    console.warn('⚠️  Multer not installed; avatar uploads will be disabled.');
  }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Fallback for index.html (so root URL loads your site)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from Plotline server!", time: new Date() });
});

// Database connection test
app.get("/api/db-test", async (req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res.json({
      status: "Database connected successfully!",
      userCount,
      timestamp: new Date()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
    });
    res.json(users.map(serializeUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    let userId;
    try {
      userId = parseUserId(req.params.id);
    } catch {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(serializeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    let userId;
    try {
      userId = parseUserId(req.params.id);
    } catch {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const { name, email, profile = {} } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userUpdates = {};
    if (typeof name === 'string') userUpdates.name = name;
    if (typeof email === 'string') userUpdates.email = email;

    const profileUpdates = {};
    if (typeof profile.bio === 'string' || profile.bio === null) profileUpdates.bio = profile.bio;
    if (typeof profile.profilePicture === 'string' || profile.profilePicture === null) {
      profileUpdates.profilePicture = profile.profilePicture;
    }
    if (typeof profile.fullName === 'string') profileUpdates.fullName = profile.fullName;
    if (profile.username !== undefined) {
      const parsedUsername = String(profile.username).trim();
      if (parsedUsername.length > 0) {
        profileUpdates.username = parsedUsername;
      }
    }

    const data = { ...userUpdates };

    if (Object.keys(profileUpdates).length > 0) {
      const createProfile = {
        username:
          typeof profileUpdates.username === 'string' && profileUpdates.username.length > 0
            ? profileUpdates.username
            : randomUsername(),
        fullName:
          profileUpdates.fullName ||
          userUpdates.name ||
          req.body.name ||
          existingUser.name ||
          'New User',
        bio: profileUpdates.bio ?? null,
        profilePicture: profileUpdates.profilePicture ?? null,
      };
      data.profile = {
        upsert: {
          create: createProfile,
          update: profileUpdates,
        },
      };
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: { profile: true },
    });

    res.json({ message: 'Profile updated', user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Upload avatar
app.post(
  '/api/users/:id/avatar',
  upload
    ? upload.single('avatar')
    : (req, res, next) => {
        req.file = null;
        next();
      },
  async (req, res) => {
    try {
      if (!upload) {
        return res.status(503).json({ error: 'Avatar uploads unavailable: multer not installed' });
      }

      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      let userId;
      try {
        userId = parseUserId(req.params.id);
      } catch {
        return res.status(400).json({ error: 'Invalid user id' });
      }

      const relativePath = `/uploads/${req.file.filename}`;

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          profile: {
            upsert: {
              create: {
                username: randomUsername(),
                fullName: existingUser.name || 'New User',
                profilePicture: relativePath,
              },
              update: {
                profilePicture: relativePath,
              },
            },
          },
        },
        include: { profile: true },
      });

      res.json({
        message: 'Avatar uploaded',
        avatar: relativePath,
        user: serializeUser(user),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Failed to upload avatar' });
    }
  }
);

// Sign Up Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {
            username: randomUsername(),
            fullName: name,
            bio: null,
            profilePicture: null,
          },
        },
      },
      include: { profile: true },
    });

    console.log(`✅ New user registered: ${user.email}`);

    res.json({
      message: 'User registered successfully!',
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// User Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful!",
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Create a new book club
app.post("/api/clubs", async (req, res) => {
  try {
    const { name, description, creatorId } = req.body;

    // Basic validation
    if (!name || !creatorId) {
      return res.status(400).json({ error: "Name and creatorId are required." });
    }

    // Create club and include creator info for convenience
    const newClub = await prisma.club.create({
      data: {
        name,
        description,
        creatorId,
      },
      include: {
        creator: {
          include: { profile: true },
        },
      },
    });

    // Automatically add the creator as a member so they can participate in reading goals
    await prisma.clubMember.create({
      data: {
        clubId: newClub.id,
        userId: Number(creatorId),
        progress: 0,
      }
    });

    // Send structured response
    res.status(201).json({
      message: "Club created successfully!",
      club: newClub,
    });
  } catch (error) {
    console.error("❌ Error creating club:", error);
    res.status(500).json({
      error: error.message || "Server error while creating club.",
    });
  }
});

// Get a club by ID
app.get("/api/clubs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const club = await prisma.club.findUnique({
      where: { id: Number(id) },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    res.json(club);
  } catch (error) {
    console.error("❌ Error fetching club:", error);
    res.status(500).json({ error: "Server error fetching club." });
  }
});

// Get clubs created by a user
app.get("/api/users/:id/clubs", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const clubs = await prisma.club.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(clubs);
  } catch (err) {
    console.error("Error fetching user clubs:", err);
    res.status(500).json({ error: "Failed to fetch clubs." });
  }
});

// Get all book clubs (for discover page)
app.get("/api/clubs", async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { name: "asc" }, 
    });

    console.log("📚 All clubs found:", clubs);
    res.json(Array.isArray(clubs) ? clubs : []);
  } catch (error) {
    console.error("❌ Error fetching clubs:", error);
    res.status(500).json({ error: "Server error while fetching clubs." });
  }
});

// Delete a club (only by creator)
app.delete("/api/clubs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // the logged-in user's ID

    const club = await prisma.club.findUnique({ where: { id: Number(id) } });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Only the creator can delete it
    if (club.creatorId !== Number(userId)) {
      return res.status(403).json({ error: "You are not authorized to delete this club." });
    }

    await prisma.club.delete({ where: { id: Number(id) } });
    res.json({ message: "Club deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting club:", error);
    res.status(500).json({ error: "Server error while deleting club." });
  }
});



// Create a test user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: 'test',
        profile: {
          create: {
            username: randomUsername(),
            fullName: name,
          },
        },
      },
      include: { profile: true },
    });
    res.json({ message: 'User created successfully', user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Assign book to club
app.put("/api/clubs/:id/book", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, bookData, readingGoal, goalDeadline } = req.body;

    const club = await prisma.club.findUnique({ where: { id: Number(id) } });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Only the creator can assign books
    if (club.creatorId !== Number(userId)) {
      return res.status(403).json({ error: "You are not authorized to assign books to this club." });
    }

    const updatedClub = await prisma.club.update({
      where: { id: Number(id) },
      data: {
        currentBookId: bookData.title || "",
        currentBookData: bookData,
        readingGoal: readingGoal || null,
        goalDeadline: goalDeadline ? new Date(goalDeadline) : null,
      },
    });

    res.json(updatedClub);
  } catch (error) {
    console.error("❌ Error assigning book:", error);
    res.status(500).json({ error: "Server error while assigning book." });
  }
});

// Remove book from club
app.delete("/api/clubs/:id/book", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const club = await prisma.club.findUnique({ where: { id: Number(id) } });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Only the creator can remove books
    if (club.creatorId !== Number(userId)) {
      return res.status(403).json({ error: "You are not authorized to remove books from this club." });
    }

    const updatedClub = await prisma.club.update({
      where: { id: Number(id) },
      data: {
        currentBookId: null,
        currentBookData: null,
        readingGoal: null,
        goalDeadline: null,
      },
    });

    res.json(updatedClub);
  } catch (error) {
    console.error("❌ Error removing book:", error);
    res.status(500).json({ error: "Server error while removing book." });
  }
});

// Update reading goal for a club
app.put("/api/clubs/:id/goal", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, readingGoal, goalDeadline } = req.body;

    const club = await prisma.club.findUnique({ where: { id: Number(id) } });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Only the creator can update the goal
    if (club.creatorId !== Number(userId)) {
      return res.status(403).json({ error: "You are not authorized to update the reading goal." });
    }

    const updatedClub = await prisma.club.update({
      where: { id: Number(id) },
      data: {
        readingGoal: readingGoal || null,
        goalDeadline: goalDeadline ? new Date(goalDeadline) : null,
      },
    });

    res.json(updatedClub);
  } catch (error) {
    console.error("❌ Error updating reading goal:", error);
    res.status(500).json({ error: "Server error while updating reading goal." });
  }
});

// Join a club
app.post("/api/clubs/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const club = await prisma.club.findUnique({ where: { id: Number(id) } });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Check if user is already a member
    const existingMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: Number(id), userId: Number(userId) } }
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already a member of this club" });
    }

    const member = await prisma.clubMember.create({
      data: {
        clubId: Number(id),
        userId: Number(userId),
        progress: 0,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(member);
  } catch (error) {
    console.error("❌ Error joining club:", error);
    res.status(500).json({ error: "Server error while joining club." });
  }
});

// Leave a club
app.delete("/api/clubs/:id/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const member = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: Number(id), userId: Number(userId) } }
    });

    if (!member) {
      return res.status(404).json({ error: "User is not a member of this club" });
    }

    await prisma.clubMember.delete({
      where: { id: member.id }
    });

    res.json({ message: "Successfully left club" });
  } catch (error) {
    console.error("❌ Error leaving club:", error);
    res.status(500).json({ error: "Server error while leaving club." });
  }
});

// Get club members
app.get("/api/clubs/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await prisma.club.findUnique({
      where: { id: Number(id) },
      select: { creatorId: true }
    });

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    const members = await prisma.clubMember.findMany({
      where: { clubId: Number(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { joinedAt: "asc" }
    });

    // Add isHost flag to each member
    const membersWithHostFlag = members.map(member => ({
      ...member,
      isHost: member.userId === club.creatorId
    }));

    res.json(membersWithHostFlag);
  } catch (error) {
    console.error("❌ Error fetching club members:", error);
    res.status(500).json({ error: "Server error while fetching members." });
  }
});

// Update member progress
app.put("/api/clubs/:id/members/:userId/progress", async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { progress } = req.body;

    // Check if club exists and get creator info
    const club = await prisma.club.findUnique({
      where: { id: Number(id) },
      select: { creatorId: true }
    });

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    let member = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: Number(id), userId: Number(userId) } }
    });

    // If member doesn't exist but user is the creator, create membership automatically
    if (!member && Number(userId) === club.creatorId) {
      member = await prisma.clubMember.create({
        data: {
          clubId: Number(id),
          userId: Number(userId),
          progress: 0,
        }
      });
    }

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const updatedMember = await prisma.clubMember.update({
      where: { id: member.id },
      data: { progress: Math.min(100, Math.max(0, progress)) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(updatedMember);
  } catch (error) {
    console.error("❌ Error updating progress:", error);
    res.status(500).json({ error: "Server error while updating progress." });
  }
});

// Get user's club memberships
app.get("/api/users/:id/clubs-joined", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    
    const memberships = await prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            creator: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    // Return clubs with progress data
    res.json(memberships.map(m => ({
      ...m.club,
      membershipProgress: m.progress,
      membershipId: m.id
    })));
  } catch (error) {
    console.error("❌ Error fetching user club memberships:", error);
    res.status(500).json({ error: "Server error while fetching memberships." });
  }
});

// SPA fallback for React Router (serve index.html for non-API routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`✅ Server running on port ${port}`);
});
