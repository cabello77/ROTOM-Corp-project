require('dotenv').config();
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { PrismaClient } = require('@prisma/client');
const { setupSocket } = require("./socket");

const app = express();
const prisma = new PrismaClient();
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

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

async function isClubMember(clubId, userId) {
  if (!clubId || !userId) return false;
  const membership = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: Number(clubId),
        userId: Number(userId),
      },
    },
  });
  return !!membership;
}


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

//dm routes
const dmRoutes = require("./routes/dm");
app.use("/api/dm", dmRoutes);

// Build/version diagnostics
app.get('/api/version', (req, res) => {
  res.json({
    version: process.env.HEROKU_RELEASE_VERSION || null,
    commit: process.env.HEROKU_SLUG_COMMIT || null,
    time: new Date(),
  });
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
    // Set cache headers to prevent stale data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const users = await prisma.user.findMany({
      include: { profile: true },
    });
    
    // Filter out any null or invalid users
    const validUsers = users.filter(user => user && user.id);
    
    res.json(validUsers.map(serializeUser));
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

// Get full profile for a user (clubs, past reads, friends)
app.get("/api/users/:id/full-profile", async (req, res) => {
  try {
    let userId;
    try {
      userId = parseUserId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        memberships: {
          select: {
            id: true,
            pageNumber: true, // user's current page in club
            joinedAt: true,
            clubId: true,
            club: {
              select: {
                id: true,
                name: true,
                description: true,
                currentBookId: true,
                currentBookData: true,
                readingGoal: true,
                readingGoalPageStart: true,
                readingGoalPageEnd: true,
                goalDeadline: true
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Map memberships into clubs with reading progress
    const clubs = (user.memberships || []).map((m) => {
      const c = m.club;
      const start = c.readingGoalPageStart;
      const end = c.readingGoalPageEnd;
      const currentPage = m.pageNumber ?? null;

      let progressPercent = null;
      if (start != null && end != null && currentPage != null) {
        const totalPages = end - start + 1;
        const pagesRead = Math.max(0, currentPage - start);
        progressPercent = Math.min(100, Math.max(0, (pagesRead / totalPages) * 100));
      }

      return {
        clubId: c.id,
        name: c.name,
        description: c.description,
        currentBookId: c.currentBookId,
        currentBookData: c.currentBookData,
        readingGoal: c.readingGoal,
        readingGoalPageStart: start,
        readingGoalPageEnd: end,
        goalDeadline: c.goalDeadline,
        pageNumber: currentPage,
        progressPercent,
        joinedAt: m.joinedAt
      };
    });

    // Past reads across all clubs the user has joined
    const clubIds = clubs.map((c) => c.clubId);
    let pastReads = [];
    if (clubIds.length > 0) {
      const pastReadsRaw = await prisma.clubBookHistory.findMany({
        where: { clubId: { in: clubIds } },
        orderBy: { finishedAt: "desc" },
        include: { club: true },
      });

      pastReads = pastReadsRaw.map((book) => ({
        clubId: book.clubId,
        type: "past",
        clubName: book.club.name,
        assignedAt: book.assignedAt,
        finishedAt: book.finishedAt,
        bookId: book.bookId,
        bookData: book.bookData,
      }));
    }

    // Friends list (both directions)
    const friendsAsUser = await prisma.friend.findMany({
      where: { userID: userId, status: "ACCEPTED" },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            profile: { select: { username: true, profilePicture: true } },
          },
        },
      },
    });

    const friendsAsFriend = await prisma.friend.findMany({
      where: { friendID: userId, status: "ACCEPTED" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: { select: { username: true, profilePicture: true } },
          },
        },
      },
    });

    const allFriends = [
      ...(friendsAsUser || []).map((f) => f.friend).filter(Boolean),
      ...(friendsAsFriend || []).map((f) => f.user).filter(Boolean),
    ];
    const uniqueFriends = Array.from(
      new Map(allFriends.map((f) => [f.id, f])).values()
    );

    res.json({
      id: user.id,
      name: user.name,
      profile: user.profile || null,
      clubs,
      pastReads,
      friends: uniqueFriends || [],
      friendsCount: (uniqueFriends || []).length,
    });
  } catch (err) {
    console.error("Error fetching full profile:", err);
    res.status(500).json({ error: "Failed to fetch full profile" });
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

          // 🔹 Check if display name already exists for another user
          if (typeof name === 'string') {
          const nameTaken = await prisma.user.findFirst({
          where: {
                    name,
                    NOT: { id: userId }, // exclude current user
          },
          });
          if (nameTaken) {
          return res.status(400).json({ error: 'Display name already taken' });
          }
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

//Sign Up Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email is already registered
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if username is already taken
    const existingName = await prisma.user.findFirst({ where: { name } });
    if (existingName) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {
            username: randomUsername(), // you can keep this or generate differently
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

    // Handle legacy plaintext passwords gracefully and upgrade to bcrypt
    const stored = user.password || '';
    let isPasswordValid = false;
    if (typeof stored === 'string' && stored.startsWith('$2')) {
      // Bcrypt hash present
      isPasswordValid = await bcrypt.compare(password, stored);
    } else {
      // Legacy plaintext stored; compare directly then upgrade hash on success
      if (password === stored) {
        isPasswordValid = true;
        try {
          const newHash = await bcrypt.hash(password, 10);
          await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
        } catch (e) {
          console.warn('Password hash upgrade failed for user', user.id, e?.message);
        }
      } else {
        isPasswordValid = false;
      }
    }
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
        role: "HOST",
        pageNumber: 0,
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

// Get a club by ID (includes currentRead and page ranges)
app.get("/api/clubs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const club = await prisma.club.findUnique({
      where: { id: Number(id) },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            }
          }
        }
      },
    });

    console.log(
      "CLUB PAGE RANGE:",
      club.readingGoalPageStart,
      club.readingGoalPageEnd
    );

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Build the currentRead object including page ranges
    const currentRead =
      club.currentBookId && club.currentBookData
        ? {
            bookId: club.currentBookId,
            bookData: club.currentBookData,
            assignedAt: club.assignedAt,
            readingGoal: club.readingGoal,
            goalDeadline: club.goalDeadline,
            readingGoalPageStart: club.readingGoalPageStart,
            readingGoalPageEnd: club.readingGoalPageEnd,
          }
        : null;

    // Return full club with page range fields included
    res.json({
      ...club,
      readingGoalPageStart: club.readingGoalPageStart,
      readingGoalPageEnd: club.readingGoalPageEnd,
      currentRead,
      currentBook: currentRead,
    });

  } catch (error) {
    console.error("Error fetching club:", error);
    return res.status(500).json({ error: "Server error fetching club." });
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

    console.log("All clubs found:", clubs);
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

// Assign book to club (host or moderator only)
app.put("/api/clubs/:id/book", async (req, res) => {
  try {
    const { id } = req.params;
    
    // FRONTEND ACTUALLY SENDS THESE KEYS 
    const { 
      userId, 
      bookDetails, 
      readingGoal, 
      goalDeadline, 
      readingGoalPageStart,
      readingGoalPageEnd 
    } = req.body;

    const clubId = Number(id);
    const uid = Number(userId);

    // Validate club
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club)
      return res.status(404).json({ error: "Club not found" });

    // Validate permissions
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: uid } },
      select: { role: true },
    });

    if (!membership)
      return res.status(403).json({ error: "You are not a member of this club." });

    if (!["HOST", "MODERATOR"].includes(membership.role))
      return res.status(403).json({ error: "Only hosts or moderators can assign books." });

    // Archive previous book if exists
    if (club.currentBookId && club.currentBookData) {
      await prisma.clubBookHistory.create({
        data: {
          clubId,
          bookId: club.currentBookId,
          bookData: club.currentBookData,
          assignedAt: club.assignedAt ?? new Date(),
          finishedAt: new Date(),
        },
      });
    }

    const rawBook = req.body.bookData || req.body.bookDetails;

    if (!rawBook) {
      return res.status(400).json({ error: "Missing book data" });
    }

    const normalizedBook = {
      title: rawBook.title,
      authors: rawBook.authors || rawBook.author || "Unknown Author",
      cover: rawBook.cover || "",
      description: rawBook.description || "No description available.",
      year: rawBook.year || null,
      genre: rawBook.genre || null,
    };

    // Save to DB
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        currentBookId: rawBook.id || rawBook.title || null,
        currentBookData: normalizedBook,
        assignedAt: new Date(),

        // reading goal (text)
        readingGoal: readingGoal || null,

        // NEW PAGE RANGE
        readingGoalPageStart:
          readingGoalPageStart === "" || readingGoalPageStart === null
            ? null
            : Number(readingGoalPageStart),

        readingGoalPageEnd:
          readingGoalPageEnd === "" || readingGoalPageEnd === null
            ? null
            : Number(readingGoalPageEnd),

        // deadline
        goalDeadline: goalDeadline || null,
      },
      include: { members: true }
    });


    // Construct readable "currentRead" object
    const currentRead = {
      bookId: updatedClub.currentBookId,
      bookData: updatedClub.currentBookData,
      assignedAt: updatedClub.assignedAt,
      readingGoal: updatedClub.readingGoal,
      readingGoalPageStart: updatedClub.readingGoalPageStart,
      readingGoalPageEnd: updatedClub.readingGoalPageEnd,
      goalDeadline: updatedClub.goalDeadline,
    };

    res.json({
      ...updatedClub,
      currentRead,
      currentBook: currentRead,
    });

  } catch (error) {
    console.error("❌ Error assigning book:", error);
    res.status(500).json({ error: "Server error while assigning book." });
  }
});

//get all past reads
app.get("/api/clubs/:id/bookshelf", async (req, res) => {
  try {
    const { id } = req.params;
      const books = await prisma.clubBookHistory.findMany({
        where: { clubId: Number(id) },  // force cast
        orderBy: { finishedAt: "desc" },
        select: {
          id: true,
          bookId: true,
          finishedAt: true,
          assignedAt: true,
          bookData: true,
        },
    });

    res.json(books);
  } catch (error) {
    console.error("Error fetching bookshelf:", error);
    res.status(500).json({ error: "Server error fetching bookshelf." });
  }
});

//mark book assigned to club as finished and added to past reads
app.post("/api/clubs/:id/book/finish", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const clubId = Number(id);
    const uid = Number(userId);

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) return res.status(404).json({ error: "Club not found" });

    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: uid } },
      select: { role: true },
    });

    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this club." });
    }

    if (!["HOST", "MODERATOR"].includes(membership.role)) {
      return res.status(403).json({ error: "Only hosts or moderators can finish books." });
    }

    if (!club.currentBookId) {
      return res.status(400).json({ error: "No current book to finish." });
    }

    await prisma.clubBookHistory.create({
      data: {
        clubId: club.id,
        bookId: club.currentBookId,
        bookData: club.currentBookData,
        assignedAt: club.assignedAt ?? new Date(),
        finishedAt: new Date(),
      },
    });

    const updated = await prisma.club.update({
      where: { id: clubId },
      data: {
        currentBookId: null,
        currentBookData: null,
        assignedAt: null,
        readingGoal: null,
        readingGoalPageStart: null,
        readingGoalPageEnd: null,
        goalDeadline: null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error finishing book." });
  }
});

// Remove book from club
app.delete("/api/clubs/:id/book", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const clubId = Number(id);
    const uid = Number(userId);

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

     const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: uid } },
      select: { role: true },
    });

    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this club." });
    }

    if (!["HOST", "MODERATOR"].includes(membership.role)) {
      return res.status(403).json({
        error: "Only hosts or moderators can remove books.",
      });
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        currentBookId: null,
        currentBookData: null,
        assignedAt: null,
        readingGoal: null,
        readingGoalPageStart: null,
        readingGoalPageEnd: null,
        goalDeadline: null,
      },
    });

    res.json(updatedClub);
  } catch (error) {
    console.error("❌ Error removing book:", error);
    res.status(500).json({ error: "Server error while removing book." });
  }
});

// Update reading goal + page range + deadline
app.put("/api/clubs/:id/goal", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userId,
      readingGoal,
      goalDeadline,
      readingGoalPageStart,
      readingGoalPageEnd
    } = req.body;

    console.log(
      "GOAL BODY:",
      readingGoalPageStart,
      readingGoalPageEnd,
      "raw body:", req.body
    );

    const clubId = Number(id);
    const uid = Number(userId);

    // Validate club exists
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) return res.status(404).json({ error: "Club not found" });

    // Check membership + role
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: uid } },
      select: { role: true },
    });

    if (!membership)
      return res.status(403).json({ error: "You are not in this club." });

    if (!["HOST", "MODERATOR"].includes(membership.role))
      return res.status(403).json({
        error: "Only hosts or moderators can update the reading goal.",
      });

    // Update fields
    const updated = await prisma.club.update({
      where: { id: clubId },
      data: {
        readingGoal: readingGoal || null,
        goalDeadline: goalDeadline || null,
        readingGoalPageStart:
          readingGoalPageStart !== undefined && readingGoalPageStart !== null
            ? Number(readingGoalPageStart)
            : null,
        readingGoalPageEnd:
          readingGoalPageEnd !== undefined && readingGoalPageEnd !== null
            ? Number(readingGoalPageEnd)
            : null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating reading goal:", error);
    res.status(500).json({ error: "Server error updating reading goal." });
  }
});


// Join a club
app.post("/api/clubs/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const clubId = Number(id);
    const parsedUserId = Number(userId);

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        readingGoalPageStart: true
      }
    });

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }


    // Check if user is already a member
    const existingMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: parsedUserId } }
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already a member of this club" });
    }

    // New member starts at the club's readingGoalPageStart
    const startPage = club.readingGoalPageStart ?? 0;

    const member = await prisma.clubMember.create({
      data: {
        clubId,
        userId: parsedUserId,
        role: "MEMBER",
        pageNumber: startPage,
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

// Send club invitation
app.post("/api/clubs/:id/invite", async (req, res) => {
  try {
    const { id } = req.params;
    const { inviterId, inviteeId } = req.body;

    const clubId = Number(id);
    const inviter = Number(inviterId);
    const invitee = Number(inviteeId);

    // Validate inputs
    if (!inviter || !invitee) {
      return res.status(400).json({ error: "Inviter and invitee IDs are required" });
    }

    // Check if club exists
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Check if inviter is a member of the club
    const inviterMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: inviter } }
    });
    if (!inviterMember) {
      return res.status(403).json({ error: "You must be a member of the club to invite others" });
    }

    // Check if invitee is already a member
    const existingMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: invitee } }
    });
    if (existingMember) {
      return res.status(400).json({ error: "User is already a member of this club" });
    }

    // Check if users are friends
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userID: inviter, friendID: invitee, status: "ACCEPTED" },
          { userID: invitee, friendID: inviter, status: "ACCEPTED" }
        ]
      }
    });
    if (!friendship) {
      return res.status(403).json({ error: "You can only invite your friends to join the club" });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.clubInvitation.findUnique({
      where: { clubId_inviteeId: { clubId, inviteeId: invitee } }
    });
    if (existingInvitation && existingInvitation.status === "PENDING") {
      return res.status(400).json({ error: "An invitation has already been sent to this user" });
    }

    // Create or update invitation
    const invitation = await prisma.clubInvitation.upsert({
      where: { clubId_inviteeId: { clubId, inviteeId: invitee } },
      update: { status: "PENDING", inviterId: inviter, updatedAt: new Date() },
      create: {
        clubId,
        inviterId: inviter,
        inviteeId: invitee,
        status: "PENDING",
      },
      include: {
        club: { select: { id: true, name: true } },
        inviter: { select: { id: true, name: true, profile: { select: { profilePicture: true } } } },
        invitee: { select: { id: true, name: true } },
      },
    });

    res.json({ message: "Invitation sent successfully", invitation });
  } catch (error) {
    console.error("❌ Error sending club invitation:", error);
    res.status(500).json({ error: "Server error while sending invitation." });
  }
});

// Get club invitations received by a user
app.get("/api/users/:id/club-invitations", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    
    const invitations = await prisma.clubInvitation.findMany({
      where: {
        inviteeId: userId,
        status: "PENDING",
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            description: true,
            creatorId: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                profilePicture: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ invitations });
  } catch (error) {
    console.error("❌ Error fetching club invitations:", error);
    res.status(500).json({ error: "Server error while fetching invitations." });
  }
});

// Respond to club invitation (accept or reject)
app.post("/api/clubs/:id/invitations/:invitationId/respond", async (req, res) => {
  try {
    const { id, invitationId } = req.params;
    const { userId, status } = req.body; // status: "ACCEPTED" or "REJECTED"

    const clubId = Number(id);
    const invId = Number(invitationId);
    const user = Number(userId);

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Status must be ACCEPTED or REJECTED" });
    }

    // Check if invitation exists and belongs to the user
    const invitation = await prisma.clubInvitation.findUnique({
      where: { id: invId },
      include: { club: true },
    });

    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    if (invitation.inviteeId !== user) {
      return res.status(403).json({ error: "You are not authorized to respond to this invitation" });
    }

    if (invitation.clubId !== clubId) {
      return res.status(400).json({ error: "Invitation does not match the club" });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ error: "Invitation has already been responded to" });
    }

    // Update invitation status
    await prisma.clubInvitation.update({
      where: { id: invId },
      data: { status, updatedAt: new Date() },
    });

    // If accepted, add user to club
    if (status === "ACCEPTED") {
      // Check if user is already a member (edge case)
      const existingMember = await prisma.clubMember.findUnique({
        where: { clubId_userId: { clubId, userId: user } }
      });

      if (!existingMember) {
        await prisma.clubMember.create({
          data: {
            clubId,
            userId: user,
            role: "MEMBER",
            // Set starting page to the club's readingGoalPageStart
            pageNumber: invitation.club.readingGoalPageStart ?? 0,
          },
        });
      }
    }

    res.json({ message: `Invitation ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error("❌ Error responding to invitation:", error);
    res.status(500).json({ error: "Server error while responding to invitation." });
  }
});

//get all current reads for a user from all the book clubs they have joined
app.get("/api/users/:userId/bookshelf/current", async (req, res) => {
  try {
    const { userId } = req.params;

    const memberships = await prisma.clubMember.findMany({
      where: { userId: Number(userId) },
      include: { club: true }
    });

    const clubIds = memberships.map(m => m.clubId);

    if (clubIds.length === 0) {
      return res.json([]);
    }

    const clubs = await prisma.club.findMany({
      where: { id: { in: clubIds } }
    });

    // Create a map of clubId to membership for quick lookup
    const membershipMap = new Map();
    memberships.forEach(m => {
      membershipMap.set(m.clubId, m);
    });

    const currentBooks = clubs
      .filter(c => c.currentBookId && c.currentBookData)
      .map(c => {
        const membership = membershipMap.get(c.id);
        const start = c.readingGoalPageStart;
        const end = c.readingGoalPageEnd;
        const currentPage = membership?.pageNumber ?? null;

        let progressPercent = null;
        if (start != null && end != null && currentPage != null) {
          const totalPages = end - start + 1;
          const pagesRead = Math.max(0, currentPage - start);
          progressPercent = Math.min(100, Math.max(0, (pagesRead / totalPages) * 100));
        }

        const bookData = {
          clubId: c.id,
          type: "current",
          clubName: c.name,
          assignedAt: c.createdAt,
          bookId: c.currentBookId,
          bookData: c.currentBookData,
          readingGoalPageStart: start,
          readingGoalPageEnd: end,
          currentPage: currentPage,
          progressPercent: progressPercent
        };

        console.log(`Bookshelf current - Club ${c.id}:`, {
          readingGoalPageStart: start,
          readingGoalPageEnd: end,
          currentPage: currentPage,
          progressPercent: progressPercent
        });

        return bookData;
      });

    console.log("Bookshelf current - Returning books:", currentBooks.map(b => ({
      clubId: b.clubId,
      readingGoalPageStart: b.readingGoalPageStart,
      readingGoalPageEnd: b.readingGoalPageEnd,
      progressPercent: b.progressPercent
    })));

    res.json(currentBooks);
  } catch (error) {
    console.error("Error fetching current reads:", error);
    res.status(500).json({ error: "Server error fetching current reads." });
  }
});

//get all past reads for a user from all the book clubs they have joined
app.get("/api/users/:userId/bookshelf/past", async (req, res) => {
  try {
    const { userId } = req.params;

    const memberships = await prisma.clubMember.findMany({
      where: { userId: Number(userId) },
      include: { club: true }
    });

    const clubIds = memberships.map(m => m.clubId);

    if (clubIds.length === 0) {
      return res.json([]);
    }

    const pastReads = await prisma.clubBookHistory.findMany({
      where: { clubId: { in: clubIds } },
      orderBy: { finishedAt: "desc" },
      include: { club: true }  
    });

    const pastBooks = pastReads.map(book => ({
      clubId: book.clubId,
      type: "past",
      clubName: book.club.name,
      assignedAt: book.assignedAt,
      finishedAt: book.finishedAt,
      bookId: book.bookId,
      bookData: book.bookData
    }));

    res.json(pastBooks);
  } catch (error) {
    console.error("Error fetching past reads:", error);
    res.status(500).json({ error: "Server error fetching past reads." });
  }
});

//friend activity
app.get("/api/books/:bookId/friends-activity/:userId", async (req, res) => {
  try {
    const { bookId, userId } = req.params;

    console.log("Looking up friends for book:", bookId);

    // 1️⃣ Get accepted friends
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userID: Number(userId), status: "ACCEPTED" },
          { friendID: Number(userId), status: "ACCEPTED" }
        ]
      },
      include: { user: true, friend: true }
    });

    const friendIds = friends.map(f =>
      f.userID === Number(userId) ? f.friendID : f.userID
    );

    if (friendIds.length === 0) {
      return res.json([]);
    }

    let results = [];

    // 2️⃣ Past reads (clubBookHistory)
    const history = await prisma.clubBookHistory.findMany({
      where: { bookId },
      include: {
        club: {
          include: {
            members: {
              include: { user: true }
            }
          }
        }
      }
    });

    history.forEach(book => {
      book.club.members.forEach(member => {
        if (friendIds.includes(member.userId)) {
          results.push({
            friendId: member.userId,
            friendName: member.user.name,
            clubName: record.club.name,
            finishedAt: record.finishedAt,
            pageNumber: member.pageNumber,            // NEW
            goalStart: record.club.readingGoalPageStart,
            goalEnd: record.club.readingGoalPageEnd,
            goalDeadline: record.club.goalDeadline
          });
        }
      });
    });

    // 3️⃣ Current reads (clubs currently reading the book)
    const activeClubs = await prisma.club.findMany({
      where: { currentBookId: bookId },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    activeClubs.forEach(club => {
      club.members.forEach(member => {
        if (friendIds.includes(member.userId)) {
          results.push({
            friendId: member.userId,
            friendName: member.user.name,
            clubName: club.name,
            finishedAt: null,
            pageNumber: member.pageNumber,            // NEW
            goalStart: club.readingGoalPageStart,
            goalEnd: club.readingGoalPageEnd,
            goalDeadline: club.goalDeadline
          });
        }
      });
    });

    res.json(results);

  } catch (err) {
    console.error("Error fetching friends' activity:", err);
    res.status(500).json({ error: "Failed to fetch friends activity" });
  }
});

app.post('/api/progress', async (req, res) => {
  const { userId, clubId, pageNumber } = req.body;

  if (!userId || !clubId || !pageNumber) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    console.log(`Updating progress for userId: ${userId}, clubId: ${clubId}, pageNumber: ${pageNumber}`);

    // Use individual fields for the `where` clause, not a combined `clubId_userId`
    const updatedProgress = await prisma.clubMember.upsert({
      where: {
        // Use the unique combination of clubId and userId
        clubId_userId: {
          clubId: parseInt(clubId),
          userId: parseInt(userId),
        },
      },
      update: {
        pageNumber: pageNumber, // Update the page number
      },
      create: {
        userId: parseInt(userId),
        clubId: parseInt(clubId),
        pageNumber: pageNumber, // Create new progress entry if not exists
        role: 'MEMBER', // Default role (adjust if needed)
      },
    });

    console.log('Progress successfully updated:', updatedProgress);

    return res.json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return res.status(500).json({ message: 'Error updating progress' });
  }
});



// Promote a club member to MODERATOR (host-only)
app.post("/api/clubs/:id/members/:memberId/promote", async (req, res) => {
  try {
    console.log("PROMOTE ROUTE HIT");
    console.log("Request body:", req.body);
    console.log("Params:", req.params);

    const clubId = Number(req.params.id);
    const memberId = Number(req.params.memberId);
    let { actingUserId } = req.body;         
    actingUserId = Number(actingUserId);


    if (isNaN(clubId) || isNaN(memberId) || isNaN(actingUserId)) {
      return res.status(400).json({ error: "Invalid numeric identifiers." });
    }

    const actingUserMembership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: actingUserId } },
    });

    if (!actingUserMembership) {
      return res.status(403).json({ error: "You are not a member of this club." });
    }

    if (actingUserMembership.role !== "HOST") {
      return res.status(403).json({
        error: "Only the host can assign moderators.",
      });
    }

    const targetMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: memberId } },
    });

    if (!targetMember) {
      return res.status(404).json({
        error: "The specified member is not part of this club.",
      });
    }


    if (targetMember.role === "HOST") {
      return res.status(400).json({
        error: "The host cannot be promoted.",
      });
    }

    if (targetMember.role === "MODERATOR") {
      return res.status(400).json({
        error: "This user is already a moderator.",
      });
    }

    const updatedMember = await prisma.clubMember.update({
      where: { id: targetMember.id },
      data: { role: "MODERATOR" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({
      message: "Member promoted to moderator successfully.",
      member: updatedMember,
    });

  } catch (error) {
    console.error("❌ Error promoting member:", error);
    return res.status(500).json({
      error: "Server error while promoting club member.",
    });
  }
});


// Club chat: get message history (members only)
app.get("/api/clubs/:id/messages", async (req, res) => {
  try {
    const clubId = Number(req.params.id);
    const userId = Number(req.query.userId);

    if (!clubId || !userId) {
      return res.status(400).json({ error: "clubId (in URL) and userId (query) are required" });
    }

    if (!(await isClubMember(clubId, userId))) {
      return res.status(403).json({ error: "You must be a member of this club to view chat." });
    }

    const before = req.query.before ? new Date(req.query.before) : new Date();
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const messages = await prisma.message.findMany({
      where: { clubId, createdAt: { lt: before } },
      orderBy: { createdAt: "desc" },
      take: limit,
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
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const normalized = messages.reverse().map((m) => ({
      id: m.id,
      clubId: m.clubId,
      content: m.content,
      createdAt: m.createdAt,
      user: {
        id: m.user.id,
        name: m.user.name,
        profilePicture: m.user.profile?.profilePicture
          ? `${baseUrl}${m.user.profile.profilePicture.startsWith("/") ? "" : "/"}${
              m.user.profile.profilePicture
            }`
          : null,
      },
    }));

    res.json(normalized);
  } catch (error) {
    console.error("❌ Error fetching club messages:", error);
    res.status(500).json({ error: "Server error while fetching messages." });
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

// GET /api/progress/:userId/:clubId
app.get('/api/progress/:userId/:clubId', async (req, res) => {
  const { userId, clubId } = req.params;

  try {
    // Get the club to check reading goal start
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
      select: { readingGoalPageStart: true }
    });

    // Get the member's progress
    const progress = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {  // Correct reference to the compound unique constraint
          clubId: parseInt(clubId),
          userId: parseInt(userId),
        },
      },
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // If the reading goal start is set and the member's pageNumber is less than it (or null),
    // update the member's pageNumber to the reading goal start
    let pageNumber = progress.pageNumber;
    if (club?.readingGoalPageStart != null) {
      if (progress.pageNumber == null || progress.pageNumber < club.readingGoalPageStart) {
        // Update this specific member's page number to the reading goal start
        const updated = await prisma.clubMember.update({
          where: {
            clubId_userId: {
              clubId: parseInt(clubId),
              userId: parseInt(userId),
            },
          },
          data: {
            pageNumber: club.readingGoalPageStart
          }
        });
        pageNumber = updated.pageNumber;
      }
    }

    return res.json({ page_number: pageNumber });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching progress' });
  }
});



// Get user's club memberships with full current book + progress data
app.get("/api/users/:id/clubs-joined", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Fetch memberships + club attached
    const memberships = await prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            creator: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // No memberships? Return empty
    if (memberships.length === 0) {
      return res.json([]);
    }

    const today = new Date();

    const clubs = memberships.map((m) => {
      const c = m.club;

      const start = c.readingGoalPageStart;
      const end = c.readingGoalPageEnd;

      const currentPage = m.pageNumber ?? start ?? null;

      // Calculate progress %
      let progressPercent = null;
      if (
        start != null &&
        end != null &&
        currentPage != null &&
        end > start
      ) {
        const total = end - start;
        const read = Math.max(0, currentPage - start);
        progressPercent = Math.min(100, Math.round((read / total) * 100));
      }

      // Days remaining
      let daysRemaining = null;
      if (c.goalDeadline) {
        const d = new Date(c.goalDeadline);
        const diffMs = d - today;
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      return {
        id: c.id,
        name: c.name,
        description: c.description,

        // Current book
        currentBookId: c.currentBookId,
        currentBookData: c.currentBookData || null,
        assignedAt: c.assignedAt || null,

        // Reading goal
        readingGoal: c.readingGoal || null,
        readingGoalPageStart: start,
        readingGoalPageEnd: end,
        goalDeadline: c.goalDeadline || null,
        daysRemaining,

        // User-specific membership data
        pageNumber: currentPage,
        progressPercent,
        membershipId: m.id,

        // Creator information for UI
        creator: c.creator,
      };
    });

    res.json(clubs);

  } catch (error) {
    console.error("❌ Error fetching user club memberships:", error);
    res.status(500).json({ error: "Server error while fetching memberships." });
  }
});

// Helpers to normalize discussion payloads for the frontend
const serializeDiscussion = (row) => {
  if (!row) return null;
  const tags = Array.isArray(row.tags)
    ? row.tags
    : (row.tags && typeof row.tags === 'object' ? row.tags : []);
  return {
    id: String(row.id),
    clubId: row.clubId,
    title: row.title,
    body: row.content?.message || '',
    author: row.user ? { id: row.user.id, name: row.user.name } : null,
    createdAt: row.datePosted,
    updatedAt: row.dateEdited || row.datePosted,
    chapterIndex: row.chapterIndex ?? null,
    tags: Array.isArray(tags) ? tags : [],
    pinned: Boolean(row.pinned),
    locked: Boolean(row.locked),
    lastActivityAt: row.dateEdited || row.datePosted,
  };
};

const serializeReply = (r) => ({
  id: String(r.id),
  threadId: String(r.discussionId),
  parentId: r.parentId ? String(r.parentId) : null,
  body: r.body,
  author: r.user ? { id: r.user.id, name: r.user.name } : null,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt || r.createdAt,
});

// Voting helpers
const clampVote = (v) => {
  const n = Number(v);
  if (n === 1) return 1;
  if (n === -1) return -1;
  if (n === 0) return 0;
  return null;
};

async function getDiscussionVoteSummary(prisma, discussionId, userId) {
  const [upvotes, downvotes, userVoteRow] = await Promise.all([
    prisma.discussionPostVote.count({ where: { discussionId, value: 1 } }),
    prisma.discussionPostVote.count({ where: { discussionId, value: -1 } }),
    userId
      ? prisma.discussionPostVote.findUnique({
          where: { userId_discussionId: { userId, discussionId } },
          select: { value: true },
        })
      : Promise.resolve(null),
  ]);
  const userVote = userVoteRow ? userVoteRow.value : 0;
  return { upvotes, downvotes, score: upvotes - downvotes, userVote };
}

async function setDiscussionVote(prisma, discussionId, userId, value) {
  const existing = await prisma.discussionPostVote.findUnique({
    where: { userId_discussionId: { userId, discussionId } },
  });
  if (value === 0) {
    if (existing) await prisma.discussionPostVote.delete({ where: { id: existing.id } });
    return getDiscussionVoteSummary(prisma, discussionId, userId);
  }
  if (!existing) {
    await prisma.discussionPostVote.create({ data: { discussionId, userId, value } });
  } else if (existing.value === value) {
    // toggle off on repeat
    await prisma.discussionPostVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.discussionPostVote.update({ where: { id: existing.id }, data: { value } });
  }
  return getDiscussionVoteSummary(prisma, discussionId, userId);
}

async function getReplyVoteSummary(prisma, replyId, userId) {
  const [upvotes, downvotes, userVoteRow] = await Promise.all([
    prisma.discussionReplyVote.count({ where: { replyId, value: 1 } }),
    prisma.discussionReplyVote.count({ where: { replyId, value: -1 } }),
    userId
      ? prisma.discussionReplyVote.findUnique({
          where: { userId_replyId: { userId, replyId } },
          select: { value: true },
        })
      : Promise.resolve(null),
  ]);
  const userVote = userVoteRow ? userVoteRow.value : 0;
  return { upvotes, downvotes, score: upvotes - downvotes, userVote };
}

async function setReplyVote(prisma, replyId, userId, value) {
  const existing = await prisma.discussionReplyVote.findUnique({
    where: { userId_replyId: { userId, replyId } },
  });
  if (value === 0) {
    if (existing) await prisma.discussionReplyVote.delete({ where: { id: existing.id } });
    return getReplyVoteSummary(prisma, replyId, userId);
  }
  if (!existing) {
    await prisma.discussionReplyVote.create({ data: { replyId, userId, value } });
  } else if (existing.value === value) {
    await prisma.discussionReplyVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.discussionReplyVote.update({ where: { id: existing.id }, data: { value } });
  }
  return getReplyVoteSummary(prisma, replyId, userId);
}

// List discussions for a club
app.get('/api/clubs/:id/discussions', async (req, res) => {
  try {
    const clubId = Number(req.params.id);
    
    if (isNaN(clubId) || clubId <= 0) {
      return res.status(400).json({ error: 'Invalid club ID' });
    }

    // Verify club exists
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const size = Math.min(50, Math.max(1, parseInt(req.query.size || '10', 10)));

    const [total, items] = await Promise.all([
      prisma.discussionPost.count({ where: { clubId } }),
      prisma.discussionPost.findMany({
        where: { clubId },
        include: { user: true, content: true },
        orderBy: [ { pinned: 'desc' }, { datePosted: 'desc' } ],
        skip: (page - 1) * size,
        take: size,
      })
    ]);

    const mapped = items.map(serializeDiscussion);
    res.json({ items: mapped, total, page, size, hasMore: (page - 1) * size + mapped.length < total });
  } catch (error) {
    console.error('Error listing discussions:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to list discussions', details: error.message });
  }
});

// Get a single discussion with replies
app.get('/api/discussion/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const thread = await prisma.discussionPost.findUnique({
      where: { id },
      include: { user: true, content: true },
    });
    if (!thread) return res.status(404).json({ error: 'Discussion not found' });

    const replies = await prisma.discussionReply.findMany({
      where: { discussionId: id },
      include: { user: true },
      orderBy: [{ createdAt: 'desc' }],
    });

    res.json({ thread: serializeDiscussion(thread), replies: replies.map(serializeReply) });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Create new discussion post
app.post('/api/discussion', async (req, res) => {
  try {
    const bodyClubId = req.body.clubId ?? req.body.bookClubID;
    const bodyUserId = req.body.userId ?? req.body.userID;
    const { message, media = [], title, chapterIndex = null, tags = [] } = req.body;

    const clubId = Number(bodyClubId);
    const userId = Number(bodyUserId);

    if (!clubId || !userId || !message || !title) {
      return res.status(400).json({ error: 'clubId, userId, title and message are required.' });
    }

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return res.status(404).json({ error: 'Club not found.' });
    }

      const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { id: true, role: true },
    });

    if (!membership) {
      return res.status(403).json({ error: 'You must be a club member to post in discussions.' });
    }

    // 🔥 Only HOST or MODERATOR may create discussion posts
    if (!["HOST", "MODERATOR"].includes(membership.role)) {
      return res.status(403).json({ 
        error: 'Only hosts or moderators can create discussion posts.' 
      });
    }

    const newDiscussion = await prisma.discussionPost.create({
      data: {
        // Explicitly connect required relations to satisfy Prisma's checked create input
        club: { connect: { id: clubId } },
        user: { connect: { id: userId } },
        hasMedia: Array.isArray(media) && media.length > 0,
        title: String(title).slice(0, 120),
        chapterIndex: chapterIndex != null ? Math.max(1, Number(chapterIndex) || 1) : null,
        tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
        content: {
          create: {
            message: String(message).slice(0, 1000),
          },
        },
        media: Array.isArray(media) && media.length > 0
          ? {
              create: media.map((file) => ({
                file: file?.path || file?.url || String(file),
                fileType: file?.type || 'unknown',
              })),
            }
          : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        content: true,
        media: true,
      },
    });

    res.status(201).json({
      message: 'Discussion post created.',
      discussion: serializeDiscussion(newDiscussion),
    });
  } catch (error) {
    console.error('Error creating discussion post:', error);
    res.status(500).json({ error: error?.message || 'Failed to create discussion' });
  }
});

// Create a reply
app.post('/api/discussion/:id/replies', async (req, res) => {
  try {
    const discussionId = Number(req.params.id);
    const { userId, parentId = null, body } = req.body;
    if (!discussionId || !userId || !body) {
      return res.status(400).json({ error: 'discussionId (in URL), userId and body are required' });
    }

    const discussion = await prisma.discussionPost.findUnique({ where: { id: discussionId }, select: { id: true, locked: true } });
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    if (discussion.locked) return res.status(403).json({ error: 'Discussion is locked' });

    const reply = await prisma.discussionReply.create({
      data: {
        discussionId,
        parentId: parentId ? Number(parentId) : null,
        userId: Number(userId),
        body: String(body).slice(0, 1000),
      },
      include: { user: true },
    });

    res.status(201).json(serializeReply(reply));
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Edit a reply (author only)
app.patch('/api/replies/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { userId, body } = req.body;
    if (!id || !userId || !body) return res.status(400).json({ error: 'id, userId and body required' });
    const existing = await prisma.discussionReply.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return res.status(404).json({ error: 'Reply not found' });
    if (existing.userId !== Number(userId)) return res.status(403).json({ error: 'Not authorized' });
    const updated = await prisma.discussionReply.update({ where: { id }, data: { body: String(body).slice(0, 1000), updatedAt: new Date() }, include: { user: true } });
    res.json(serializeReply(updated));
  } catch (error) {
    console.error('Error editing reply:', error);
    res.status(500).json({ error: 'Failed to edit reply' });
  }
});

// Votes: discussion
app.get('/api/discussion/:id/votes', async (req, res) => {
  try {
    const discussionId = Number(req.params.id);
    if (!discussionId) return res.status(400).json({ error: 'Invalid discussion id' });
    const discussion = await prisma.discussionPost.findUnique({ where: { id: discussionId }, select: { id: true } });
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const summary = await getDiscussionVoteSummary(prisma, discussionId, userId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching discussion votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

app.post('/api/discussion/:id/vote', async (req, res) => {
  try {
    const discussionId = Number(req.params.id);
    const { userId, value } = req.body;
    const v = clampVote(value);
    if (!discussionId || !userId || v === null) {
      return res.status(400).json({ error: 'discussionId (in URL), userId and value (-1,0,1) are required' });
    }
    const discussion = await prisma.discussionPost.findUnique({ where: { id: discussionId }, select: { id: true, locked: true } });
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    // allow voting on locked threads (discussion is closed to new content) – adjust if needed
    const summary = await setDiscussionVote(prisma, discussionId, Number(userId), v);
    res.json(summary);
  } catch (error) {
    console.error('Error casting discussion vote:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// Votes: replies
app.get('/api/replies/:id/votes', async (req, res) => {
  try {
    const replyId = Number(req.params.id);
    if (!replyId) return res.status(400).json({ error: 'Invalid reply id' });
    const reply = await prisma.discussionReply.findUnique({ where: { id: replyId }, select: { id: true } });
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const summary = await getReplyVoteSummary(prisma, replyId, userId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching reply votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

app.post('/api/replies/:id/vote', async (req, res) => {
  try {
    const replyId = Number(req.params.id);
    const { userId, value } = req.body;
    const v = clampVote(value);
    if (!replyId || !userId || v === null) {
      return res.status(400).json({ error: 'replyId (in URL), userId and value (-1,0,1) are required' });
    }
    const reply = await prisma.discussionReply.findUnique({ where: { id: replyId }, select: { id: true } });
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    const summary = await setReplyVote(prisma, replyId, Number(userId), v);
    res.json(summary);
  } catch (error) {
    console.error('Error casting reply vote:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

app.delete('/api/replies/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { userId } = req.body;
    if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
    const existing = await prisma.discussionReply.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return res.status(404).json({ error: 'Reply not found' });
    if (existing.userId !== Number(userId)) return res.status(403).json({ error: 'Not authorized' });
    await prisma.discussionReply.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

//create friendship/send friend request (user sends request to friend)
app.post('/api/friends', async(req, res) => {
          try {
                    const {userId, friendId} = req.body;
                    if (!userId || !friendId) {
                              return res.status(400).json({error: 'userId and friendId are required'});
                    }

                    if (userId == friendId) {
                              return res.status(400).json({error: "You cannot send a friend request to yourself."});
                    }

                    const existingRequest = await prisma.friend.findFirst ({
                              where: {
                                        OR: [
                                                  {userID: Number(userId), friendID: Number(friendId)},
                                                  {userID: Number(friendId), friendID: Number(userId)},
                                        ],
                              },
                    });

                    if(existingRequest) {
                              return res.status(400).json({error: "Friend request or friendship already exists."});
                    }

                    const friendship = await prisma.friend.create ({
                              data: {
                                        userID: Number(userId),
                                        friendID: Number(friendId),
                                        status: "PENDING",
                    },
                    });
                    
                    // TODO: Create notification for the friend when notification system is implemented
                    // For now, the friend request is stored in the database and can be retrieved
                    // by querying pending requests where friendId matches the recipient
                    
                    res.json({message: "Friend request sent.", friendship});
          } catch (error) {
                    console.error('Error sending friend request:', error);
                    res.status(500).json({error: 'Failed to send friend request'});
          }
});

//accept or decline friend request
app.post("/api/friends/respond", async (req, res) => {
          try {
                    const {userId, friendId, friendStatus} = req.body;

                    if (!userId || !friendId || !friendStatus) {
                              return res.status(400).json({error: "userId, friendId, and friendStatus are required."});
                    } 
                    
                    const request = await prisma.friend.findFirst({
                              where: {
                                        userID: Number(friendId),
                                        friendID: Number(userId),
                                        status: "PENDING",
                              }
                    });

                    if (!request) {
                              return res.status(404).json({error: "No pending friend request."});
                    }

                    const updatedStatus = await prisma.friend.update ({
                              where: {id: request.id},
                              data: {status: friendStatus},
                    });

                    if (friendStatus == "ACCEPTED") {
                              const reverseExists = await prisma.friend.findFirst({
                                        where: {
                                                  userID: Number(userId),
                                                  friendID: Number(friendId),
                                        },
                              });

                              if(!reverseExists) {
                                        await prisma.friend.create({
                                                  data: {
                                                            userID: Number(userId),
                                                            friendID: Number(friendId),
                                                            status: "ACCEPTED",
                                                  },
                                        });
                              }

                              // Get user names for notification message
                              const [accepter, requester] = await Promise.all([
                                        prisma.user.findUnique({ where: { id: Number(userId) }, select: { name: true } }),
                                        prisma.user.findUnique({ where: { id: Number(friendId) }, select: { name: true } }),
                              ]);

                              res.json({
                                        message: "Friend request accepted.",
                                        accepterName: accepter?.name || "User",
                                        requesterName: requester?.name || "User",
                              });
                    }

                    if (friendStatus == "DECLINED") {
                              // Delete the pending request when declined
                              await prisma.friend.delete({
                                        where: { id: request.id },
                              });
                              res.json({ message: "Friend request declined." });
                    }

          } catch (error) {
                    console.error("Error responding to friend request: ", error);
                    res.status(500).json({error: "Server error while responding to friend request."});
          }
});

//getting pending friend requests sent by user (must be before /api/friends/:userId)
app.get("/api/friends/:userId/pending", async(req, res) => {
          const userId = Number(req.params.userId);
          try {
                    const pendingRequests = await prisma.friend.findMany ({
                              where: { userID: userId, status: "PENDING"},
                              include: {
                                        friend: {
                                                  select: {
                                                            id: true,
                                                            name: true,
                                                            profile : {
                                                                      select: {
                                                                                username: true,
                                                                                profilePicture: true,
                                                                      },
                                                            },
                                                  },
                                        },
                              },
                    });
                    
                    res.json({pendingRequests});

          } catch (error) {
                    console.error("Error getting pending friend requests: ", error);
                    res.status(500).json({error: "Failed to get pending friend requests."});
          }
});

//getting pending friend requests received by user (for notifications) - must be before /api/friends/:userId
app.get("/api/friends/:userId/received", async(req, res) => {
          const userId = Number(req.params.userId);
          try {
                    const receivedRequests = await prisma.friend.findMany ({
                              where: { friendID: userId, status: "PENDING"},
                              include: {
                                        user: {
                                                  select: {
                                                            id: true,
                                                            name: true,
                                                            profile : {
                                                                      select: {
                                                                                username: true,
                                                                                profilePicture: true,
                                                                      },
                                                            },
                                                  },
                                        },
                              },
                              orderBy: { id: 'desc' },
                    });
                    
                    res.json({receivedRequests});

          } catch (error) {
                    console.error("Error getting received friend requests: ", error);
                    res.status(500).json({error: "Failed to get received friend requests."});
          }
});

//get friend profile (only if they are friends) - MUST be before /api/friends/:userId
app.get("/api/friends/:userId/:friendId/profile", async (req, res) => {
          console.log('=== Friend profile route hit ===');
          console.log('Request path:', req.path);
          console.log('Request params:', req.params);
          console.log('Request method:', req.method);
          try {
                    const userId = Number(req.params.userId);
                    const friendId = Number(req.params.friendId);
                    console.log('Parsed userId:', userId, 'friendId:', friendId);
                    
                    if (isNaN(userId) || isNaN(friendId)) {
                              return res.status(400).json({error: "Invalid user IDs"});
                    }
                    
                    // Check if they are friends
                    console.log('Checking friendship...');
                    const friendship = await prisma.friend.findFirst({
                              where: {
                                        status: "ACCEPTED",
                                        OR: [
                                                  {userID: userId, friendID: friendId},
                                                  {userID: friendId, friendID: userId},
                                        ]
                              },
                    });
                    console.log('Friendship check result:', friendship ? 'Found' : 'Not found');

                    if (!friendship) {
                              console.log('Not friends, returning 403');
                              return res.status(403).json({error: "You are not friends with this user."});
                    }

                    console.log('Friends confirmed, fetching profile...');
                    // Get friend's full profile data
                    const friendProfile = await prisma.user.findUnique({
                    where: { id: friendId },
                    include: {
                    profile: true,
                    memberships: {
                              select: {
                              id: true,
                              clubId: true,
                              pageNumber: true,
                              joinedAt: true,
                              club: {
                              select: {
                              id: true,
                              name: true,
                              description: true,
                              currentBookId: true,
                              currentBookData: true,
                              readingGoal: true,
                              readingGoalPageStart: true,
                              readingGoalPageEnd: true,
                              goalDeadline: true
                              }
                              }
                              }
                    }
                    }
                    });

                    if (!friendProfile) {
                              console.log('Friend profile not found');
                              return res.status(404).json({error: "User not found."});
                    }

                    console.log('Friend profile found, fetching friends list...');
                    // Get friends - need to check both directions
                    const friendsAsUser = await prisma.friend.findMany({
                              where: {
                                        userID: friendId,
                                        status: "ACCEPTED",
                              },
                              include: {
                                        friend: {
                                                  select: {
                                                            id: true,
                                                            name: true,
                                                            profile: {
                                                                      select: {
                                                                                username: true,
                                                                                profilePicture: true,
                                                                      },
                                                            },
                                                  },
                                        },
                              },
                    });

                    const friendsAsFriend = await prisma.friend.findMany({
                              where: {
                                        friendID: friendId,
                                        status: "ACCEPTED",
                              },
                              include: {
                                        user: {
                                                  select: {
                                                            id: true,
                                                            name: true,
                                                            profile: {
                                                                      select: {
                                                                                username: true,
                                                                                profilePicture: true,
                                                                      },
                                                            },
                                                  },
                                        },
                              },
                    });

                    // Combine and deduplicate friends
                    const allFriends = [
                              ...(friendsAsUser || []).map(f => f.friend).filter(Boolean),
                              ...(friendsAsFriend || []).map(f => f.user).filter(Boolean),
                    ];
                    const uniqueFriends = Array.from(
                              new Map(allFriends.filter(f => f && f.id).map(f => [f.id, f])).values()
                    );

                    // Format the response
                    const clubs = (friendProfile.memberships || []).map(m => {
                    const c = m.club;
                    const start = c.readingGoalPageStart;
                    const end = c.readingGoalPageEnd;
                    const currentPage = m.pageNumber ?? null;

                    let progressPercent = null;
                    if (start != null && end != null && currentPage != null) {
                    const totalPages = end - start + 1;
                    const pagesRead = Math.max(0, currentPage - start);
                    progressPercent = Math.min(100, Math.max(0, (pagesRead / totalPages) * 100));
                    }

                    return {
                    clubId: c.id,
                    name: c.name,
                    description: c.description,
                    currentBookId: c.currentBookId,
                    currentBookData: c.currentBookData,
                    readingGoal: c.readingGoal,
                    readingGoalPageStart: start,
                    readingGoalPageEnd: end,
                    goalDeadline: c.goalDeadline,

                    // reading progress as percentage
                    progressPercent,
                    currentPage,
                    joinedAt: m.joinedAt
                    };
                    });

                    const friends = uniqueFriends;

                    console.log('Friend profile data prepared, sending response...');
                    res.json({
                              id: friendProfile.id,
                              name: friendProfile.name,
                              profile: friendProfile.profile || null,
                              clubs: clubs || [],
                              friends: friends || [],
                              friendsCount: (friends || []).length,
                    });
          } catch (error) {
                    console.error("Error getting friend profile: ", error);
                    console.error("Error stack: ", error.stack);
                    res.status(500).json({error: "Failed to get friend profile.", details: error.message});
          }
});

//getting friends of user
app.get("/api/friends/:userId", async(req, res) => {
          const userId = Number(req.params.userId);
          try {
                    const friends = await prisma.friend.findMany ({
                              where: { userID: userId, status: "ACCEPTED"},
                              include: {
                                        friend: {
                                                  select: {
                                                            id: true,
                                                            name: true,
                                                            profile : {
                                                                      select: {
                                                                                username: true,
                                                                                profilePicture: true,
                                                                      },
                                                            },
                                                  },
                                        },
                              },
                    });
                    
                    res.json({friends});

          } catch (error) {
                    console.error("Error getting friends: ", error);
                    res.status(500).json({error: "Failed to get friends."});
          }
});

//delete friendship when user wants to remove friend
app.delete('/api/friends/:userId/:friendId', async (req, res) => {
          try {
                    const userId = Number(req.params.userId);
                    const friendId = Number(req.params.friendId);
                    const friendship = await prisma.friend.findFirst({
                              where: {
                                        status: "ACCEPTED",
                                        OR: [
                                                  {userID: Number(userId), friendID: Number(friendId)},
                                                  {userID: Number(friendId), friendID: Number(userId)},
                                        ]
                              },
                    });

                    if (!friendship) {
                              return res.status(400).json({error: "No existing friendship between the users."});
                    }
                    await prisma.friend.deleteMany({
                              where: {
                                        OR: [
                                                  {userID: Number(userId), friendID: Number(friendId)},
                                                  {userID: Number(friendId), friendID: Number(userId)},
                                        ],
                              },
                    });

                    res.json({message: "Friend deleted."});
          } catch (error) {
                    console.error("Error removing friendship: ", error);
                    res.status(500).json({error: "Failed to remove friend."});
          }
});

// SPA fallback for React Router (serve index.html for non-API routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server WITH Socket.IO
const port = process.env.PORT || 3001;
const host = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocket(io);

// Simple auth for sockets: we pass userId in query from the frontend
io.use((socket, next) => {
  const raw = socket.handshake.query.userId;
  const userId = Number(raw);
  if (!userId || Number.isNaN(userId)) {
    return next(new Error("userId is required"));
  }
  socket.userId = userId;
  next();
});

const clubRoom = (clubId) => `club:${clubId}`;

server.listen(port, host, () => {
  console.log(`✅ Server with Socket.IO running on port ${port}`);
});

// Get all DM conversations for a user
app.get("/api/dm/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const convos = await prisma.directMessage.findMany({
      where: {
        OR: [
          { user1Id: Number(userId) },
          { user2Id: Number(userId) }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            profile: { select: { profilePicture: true } }
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            profile: { select: { profilePicture: true } }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profile: { select: { profilePicture: true } }
              }
            }
          }
        }
      }
    });

    res.json(convos);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to load conversations" });
  }
});

//get or create DM conversation
app.get("/api/dm/conversation", async (req, res) => {
  const { userId, friendId } = req.query;

  if (!userId || !friendId) {
    return res.status(400).json({ error: "Missing userId or friendId" });
  }

  const u1 = Number(userId);
  const u2 = Number(friendId);

  // Try to find existing conversation
  let convo = await prisma.directMessage.findFirst({
    where: {
      OR: [
        { user1Id: u1, user2Id: u2 },
        { user1Id: u2, user2Id: u1 }
      ]
    }
  });

  // If none exists, create one
  if (!convo) {
    convo = await prisma.directMessage.create({
      data: { user1Id: u1, user2Id: u2 }
    });
  }

  res.json({ conversationId: convo.id });
});


// 3️⃣ Get DM messages
app.get("/api/dm/messages/:convoId", async (req, res) => {
  const { convoId } = req.params;

  try {
    const messages = await prisma.dMMessage.findMany({
      where: { convoId },
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
    console.error("Error fetching DM messages:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});


// Delete DM conversation
app.delete("/api/dm/conversation/:convoId", async (req, res) => {
  const { convoId } = req.params;
  try {
    await prisma.directMessage.delete({
      where: { id: convoId }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting DM:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});
