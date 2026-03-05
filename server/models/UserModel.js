const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

// Assignment Submission Schema
const AssignmentSubmissionSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  textSubmission: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, default: null },
  feedback: { type: String, default: "" }
}, { _id: false });

// Quiz Result Schema
const QuizResultSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  score: { type: Number, required: true }, // percentage
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  answers: [{ type: mongoose.Schema.Types.Mixed }], // user's answers
  passed: { type: Boolean, required: true },
  attemptedAt: { type: Date, default: Date.now }
}, { _id: false });

// Course Progress Schema
const CourseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  
  // Tracking completed lessons
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  
  // Current position in course
  currentModuleId: { type: mongoose.Schema.Types.ObjectId },
  currentLessonId: { type: mongoose.Schema.Types.ObjectId },
  
  // Assignment submissions
  assignmentSubmissions: [AssignmentSubmissionSchema],
  
  // Quiz results
  quizResults: [QuizResultSchema],
  
  // Final test
  finalTestScore: { type: Number, default: null },
  finalTestPassed: { type: Boolean, default: false },
  finalTestAttempts: { type: Number, default: 0 },
  
  // Completion tracking
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  badgeEarned: { type: Boolean, default: false },
  
  // Progress percentage
  progressPercentage: { type: Number, default: 0 },
  
  lastAccessedAt: { type: Date, default: Date.now }
}, { _id: true });

// Learning Time Tracker (overall + per-course)
const LearningByCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  totalSeconds: { type: Number, default: 0, min: 0 },
  lastTrackedAt: { type: Date, default: Date.now }
}, { _id: false });

const LearningSessionSchema = new mongoose.Schema({
  // If you want to track current session server-side (optional)
  isActive: { type: Boolean, default: false },
  startedAt: { type: Date, default: null },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  // Basic Identity
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 4,
    maxlength: 24,
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: { type: String, required: true },

  // User Permissions
  accountType: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },

  // Learning relationships
  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  completedCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  // Detailed course progress tracking
  courseProgress: [CourseProgressSchema],

  registeredSeminars: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Seminar" }
  ],

  completedTutorials: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Tutorial" }
  ],

  bookmarkedTutorials: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Tutorial" }
  ],

  savedPodcasts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Podcast" }
  ],

    // Total Learning Time Tracker (store seconds; convert to hours in UI)
  learning: {
    totalSeconds: { type: Number, default: 0, min: 0 },

    // Per-course totals
    byCourse: [LearningByCourseSchema],

    // Optional: track an active learning session
    activeSession: { type: LearningSessionSchema, default: () => ({}) },

    updatedAt: { type: Date, default: Date.now }
  },
},
  {
    timestamps: true,
  }
);

// Password hashing
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

// Fast lookups
UserSchema.index({ accountType: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ enrolledCourses: 1 });
UserSchema.index({ completedCourses: 1 });
UserSchema.index({ bookmarkedTutorials: 1 });
UserSchema.index({ "courseProgress.courseId": 1 });
UserSchema.index({ "learning.byCourse.courseId": 1 });

module.exports = mongoose.model("User", UserSchema);
