require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------
// CONNECT TO MONGO
// ------------------------------
if (process.env.NODE_ENV !== "test") {
  connectDB().catch((err) => console.error("MongoDB connection error:", err));
}

// ------------------------------
// STRIPE WEBHOOK (MUST BE BEFORE express.json())
// ------------------------------
const stripeWebhook = require("./routes/stripeWebhook");

app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ------------------------------
// NORMAL MIDDLEWARE
// ------------------------------
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ------------------------------
// ROUTES
// ------------------------------
const academyRoutes = require("./routes/academy");
const coursesRoutes = require("./routes/courses");
const tutorialsRoutes = require("./routes/tutorials");
const seminarsRoutes = require("./routes/seminars");
const podcastsRoutes = require("./routes/podcasts");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");

app.use("/api/academy", academyRoutes);
app.use("/api/academy/courses", coursesRoutes);
app.use("/api/academy/tutorials", tutorialsRoutes);
app.use("/api/academy/seminars", seminarsRoutes);
app.use("/api/academy/podcasts", podcastsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

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
// ERROR HANDLER
// ------------------------------
app.use((err, req, res, _next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ------------------------------
// START SERVER
// ------------------------------
let server;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = { app, server };