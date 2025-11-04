const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["Video", "Article", "Quiz", "Other"], default: "Video" },
  duration: { type: String },
  contentUrl: { type: String },
});

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [LessonSchema],
});

const InstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  avatarUrl: { type: String },
});

const CourseSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  category: { type: String },
  thumbnail: { type: String },
  isLiteVersion: { type: Boolean, default: false }, // For free/limited access courses

  // Instructor Info
  instructor: InstructorSchema,

  // Pricing Info
  pricing: {
    type: String,
    enum: ["Free", "Paid"],
    default: "Free",
  },
  priceAmount: { type: Number, default: 0 }, // Optional, only used if pricing is "Paid"

  // Content / Learning Points
  learningPoints: [{ type: String }],

  // Modules and Lessons
  modules: [ModuleSchema],

  // Course Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", CourseSchema);
