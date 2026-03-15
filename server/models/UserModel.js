const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

// Assignment Submission Schema
const AssignmentSubmissionSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  textSubmission: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, default: null },
  feedback: { type: String, default: "" }
}, { _id: false });

// Quiz Result Schema
const QuizResultSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  answers: [{ type: mongoose.Schema.Types.Mixed }],
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

  completedLessons: [{
    type: String
  }],

  currentModuleId: { type: String, default: null },
  currentLessonId: { type: String, default: null },

  assignmentSubmissions: [AssignmentSubmissionSchema],
  quizResults: [QuizResultSchema],

  finalTestScore: { type: Number, default: null },
  finalTestPassed: { type: Boolean, default: false },
  finalTestAttempts: { type: Number, default: 0 },

  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  badgeEarned: { type: Boolean, default: false },

  progressPercentage: { type: Number, default: 0 },

  lastAccessedAt: { type: Date, default: Date.now }
}, { _id: true });

const UserSchema = new mongoose.Schema({
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

  accountType: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },

  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  completedCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

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
},
{
  timestamps: true,
});

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

UserSchema.index({ role: 1 });
UserSchema.index({ enrolledCourses: 1 });
UserSchema.index({ completedCourses: 1 });
UserSchema.index({ bookmarkedTutorials: 1 });
UserSchema.index({ "courseProgress.courseId": 1 });

module.exports = mongoose.model("User", UserSchema);