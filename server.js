require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");  // <-- Add this line
const { PrismaClient } = require('@prisma/client');


const app = express();
const prisma = new PrismaClient();

// File upload handling for avatars
const multer = require('multer');
const uploadDir = path.join(__dirname, 'public', 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    if (ok) cb(null, true);
    else cb(new Error('Only JPG/PNG images are allowed'));
  }
});

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
      userCount: userCount,
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
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile (bio, name, readingProgress, bookClubs, friends)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, bio, readingProgress, bookClubs, friends } = req.body;
    const data = {};
    if (name) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (readingProgress !== undefined) data.readingProgress = readingProgress;
    if (bookClubs !== undefined) data.bookClubs = bookClubs;
    if (friends !== undefined) data.friends = friends;

    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Upload avatar
app.post('/api/users/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const relativePath = `/uploads/${req.file.filename}`;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { avatar: relativePath } });
    res.json({ message: 'Avatar uploaded', avatar: relativePath, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to upload avatar' });
  }
});

// Sign Up Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for missing fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    console.log(`✅ New user registered: ${user.email}`);

    // Respond without sending the hashed password
    res.json({
      message: 'User registered successfully!',
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ✅ User Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check for missing fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 2️⃣ Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3️⃣ Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 4️⃣ Return success (optionally later: return a JWT)
    res.json({
      message: "Login successful!",
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});


// Create a test user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        email
      }
    });
    res.json({ message: 'User created successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// SPA fallback for React Router (serve index.html for non-API routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

//Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
