const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "instructor"], default: "student" },

  // Profile info
  title: { type: String, default: "Freelance Specialist" },
  avatarURL: { type: String },
  badges: { type: Number, default: 0 },

  // Course tracking
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  // Stats
  totalLearningHours: { type: Number, default: 0 },
  averageProgress: { type: Number, default: 0 }, // %
  dateJoined: { type: Date, default: Date.now },

  // Payment info (if needed later)
  stripeCustomerId: { type: String },
});

module.exports = mongoose.model("User", userSchema);
