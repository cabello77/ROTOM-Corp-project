const express = require("express");
const path = require("path");
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

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

//Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
