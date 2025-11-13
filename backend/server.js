require("dotenv").config({ path: __dirname + "/../.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());

// Import route files
const academyRoutes = require("./routes/academy");
const coursesRoutes = require("./routes/courses");
const tutorialsRoutes = require("./routes/tutorials");
const seminarsRoutes = require("./routes/seminars");
const podcastsRoutes = require("./routes/podcasts");

// Backend Routes
app.use("/api/academy", academyRoutes);
app.use("/api/academy/courses", coursesRoutes);
app.use("/api/academy/tutorials", tutorialsRoutes);
app.use("/api/academy/seminars", seminarsRoutes);
app.use("/api/academy/podcasts", podcastsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running properly" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


// Function to start server for tests
async function startServer() {
  if (process.env.NODE_ENV === "test") {
    await connectDB(); // connect to MongoDB in test
  }
  return new Promise((resolve) => {
    const s = app.listen(PORT, () => resolve(s));
  });
}

// Function to stop server and disconnect MongoDB
async function stopServer(s) {
  if (s) await s.close();
  if (mongoose.connection.readyState) await mongoose.disconnect();
}

module.exports = { app, startServer, stopServer };
