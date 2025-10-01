const express = require("express");
const path = require("path");

const app = express();

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Fallback for index.html (so root URL loads your site)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from ROTOM server!", time: new Date() });
});

//Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});