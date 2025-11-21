require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------
// GLOBAL ERROR HANDLERS
// ------------------------------
process.on("uncaughtException", err => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", err => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

// ------------------------------
// CONNECT TO MONGO
// ------------------------------
if (process.env.NODE_ENV !== "test") {
  connectDB().catch((err) => console.error("MongoDB connection error:", err));
}

// ------------------------------
// MIDDLEWARE
// ------------------------------
app.use(cors());
app.use(express.json());

// ------------------------------
// ROUTES
// ------------------------------
const academyRoutes = require("./routes/academy");
const coursesRoutes = require("./routes/courses");
const tutorialsRoutes = require("./routes/tutorials");
const seminarsRoutes = require("./routes/seminars");
const podcastsRoutes = require("./routes/podcasts");
const userRoutes = require("./routes/users");

app.use("/api/academy", academyRoutes);
app.use("/api/academy/courses", coursesRoutes);
app.use("/api/academy/tutorials", tutorialsRoutes);
app.use("/api/academy/seminars", seminarsRoutes);
app.use("/api/academy/podcasts", podcastsRoutes);
app.use("/api/users", userRoutes);

// ------------------------------
// HEALTH CHECK
// ------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend is running properly",
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------
// GLOBAL ERROR HANDLER
// ------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ------------------------------
// START SERVER (ALWAYS RUNS)
// ------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
}

// ------------------------------
// EXPORTS FOR TESTS
// ------------------------------
async function startServer() {
  // In test mode, connect here (we skipped it above)
  if (process.env.NODE_ENV === "test") {
    await connectDB().catch((err) =>
      console.error("MongoDB connection error (test):", err)
    );
  }

  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Test server running on port ${PORT}`);
      resolve(server);
    });
  });
}

async function stopServer(server) {
  if (server && server.close) {
    await server.close();
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { app, startServer, stopServer };