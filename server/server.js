require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------
// CONNECT TO MONGO
// ------------------------------
if (process.env.NODE_ENV !== "test") {
  connectDB().catch((err) =>
    console.error("MongoDB connection error:", err)
  );
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
// Only use CORS in development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
}

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  //res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// ------------------------------
// API ROUTES (MUST COME BEFORE STATIC FILES)
// ------------------------------
const academyRoutes = require("./routes/academy");
const coursesRoutes = require("./routes/courses");
const tutorialsRoutes = require("./routes/tutorials");
const seminarsRoutes = require("./routes/seminars");
const podcastsRoutes = require("./routes/podcasts");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const courseProgressRoutes = require("./routes/courseProgress");
const uploadRoutes = require("./routes/upload");
const instructorRoutes = require('./routes/instructor');
const assignmentRoutes = require('./routes/assignments');
const learningRoutes = require("./routes/learningRoutes");
const adminRoutes = require("./routes/admin");

app.use("/api/academy", academyRoutes);
app.use("/api/academy/courses", coursesRoutes);
app.use("/api/academy/tutorials", tutorialsRoutes);
app.use("/api/academy/seminars", seminarsRoutes);
app.use("/api/academy/podcasts", podcastsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/courses", courseProgressRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use("/api/learning", learningRoutes);

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
// SERVE REACT APP IN PRODUCTION
// ------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Handle React routing - send all non-API requests to React
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Send everything else to React
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// ------------------------------
// START SERVER
// ------------------------------
let server;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = { app, server };
