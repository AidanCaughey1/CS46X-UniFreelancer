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
  isLiteVersion: { type: Boolean, default: false },

  // Instructor Info
  instructor: InstructorSchema,

  // Pricing
  pricing: {
    type: String,
    enum: ["Free", "Paid"],
    default: "Free",
  },
  priceAmount: { type: Number, default: 0 },

  // Learning Content
  learningPoints: [{ type: String }],
  modules: [ModuleSchema],

  // Course Relationships
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  totalHours: { type: Number, default: 0 },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", CourseSchema);
