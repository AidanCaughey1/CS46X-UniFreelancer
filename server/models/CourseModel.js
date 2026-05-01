const mongoose = require("mongoose");

const InstructorSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true }, // ADD THIS LINE
  name: { type: String, required: true },
  title: { type: String, default: "" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  email: { type: String, default: "" } 
}, { _id: false });

const PricingSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  type: {
    type: String,
    enum: ["one-time", "subscription"],
    default: "one-time"
  },
}, { _id: false });

const SubscriptionSchema = new mongoose.Schema({
  isSubscriptionCourse: { type: Boolean, default: false },
  tier: { type: String, default: "" }
}, { _id: false });

// NEW: Learning Materials Schema
const LearningMaterialsSchema = new mongoose.Schema({
  readings: [{
    title: { type: String },
    author: { type: String },
    citation: { type: String },
    link: { type: String }
  }],
  podcasts: [{
    title: { type: String },
    link: { type: String }
  }],
  videos: [{
    title: { type: String },
    link: { type: String }
  }]
}, { _id: false });

// NEW: Assignment Question Schema with different types
const AssignmentQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['multiple-choice', 'written', 'matching', 'pdf-upload', 'true-false'],
    required: true 
  },
  
  // Common fields
  question: { type: String, required: true },
  points: { type: Number, default: 10 },
  
  // For multiple-choice
  options: [{ type: String }],
  correctAnswer: { type: Number }, // index of correct option
  
  // For matching
  matchPairs: [{
    left: { type: String },
    right: { type: String }
  }],
  
  // For written response
  wordLimit: { type: Number },
  rubric: { type: String },
  
  // For PDF upload
  fileRequirements: { type: String }
  
}, { _id: false });

// Updated Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  purpose: { type: String },
  instructions: { type: String },
  
  // NEW: Question-based structure
  questions: [AssignmentQuestionSchema],
  
  // DEPRECATED: Old part-based structure (keep for backward compatibility)
  parts: [{
    partNumber: { type: Number },
    title: { type: String },
    instructions: { type: String }
  }],
  
  gradingCriteria: [{
    name: { type: String },
    points: { type: Number }
  }],
  
  deliverableFormat: { type: String },
  totalPoints: { type: Number, default: 100 }
  
}, { _id: false });

// Lesson Schema (videos, assignments, quizzes within a module)
const LessonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "assignment", "quiz"],
    required: true
  },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  
  // For VIDEO lessons
  videoUrl: { type: String, default: "" },
  duration: { type: String, default: "" },
  
  // For ASSIGNMENT lessons
  assignmentType: {
    type: String,
    enum: ["text", "file", "both"],
    default: "text"
  },
  instructions: { type: String, default: "" },
  
  // For QUIZ lessons
  questions: [{
    question: { type: String },
    questionType: {
      type: String,
      enum: ["multiple-choice", "short-answer"],
      default: "multiple-choice"
    },
    options: [{ type: String }], // for multiple choice
    correctAnswer: { type: String }, // answer text or option index
    points: { type: Number, default: 1 }
  }],
  passingScore: { type: Number, default: 70 }, // percentage
  
}, { _id: true });

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  order: { type: Number, default: 0 },
  
  // NEW: Academic structure
  learningOutcomes: { type: [String], default: [] },
  learningMaterials: { type: LearningMaterialsSchema, default: () => ({ readings: [], podcasts: [], videos: [] }) },
  assignment: { type: AssignmentSchema, default: null },
  
  // Array of lessons (kept for compatibility)
  lessons: { type: [LessonSchema], default: [] },
  
  // DEPRECATED: Old fields kept for backward compatibility
  videoUrl: { type: String, default: "" },
  articleContent: { type: String, default: "" },
  pdfUrl: { type: String, default: "" },
  hasQuiz: { type: Boolean, default: false },
  quizData: { type: Object, default: null },
  learningPoints: { type: [String], default: [] },
  duration: { type: String, default: "" },
  estimatedMinutes: { type: Number, default: 0 },
  thumbnail: { type: String, default: "" },
}, { _id: true });

// Final Test Schema
const FinalTestSchema = new mongoose.Schema({
  title: { type: String, default: "Final Test" },
  description: { type: String, default: "" },
  passingScore: { type: Number, default: 70 },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Number },
    points: { type: Number, default: 1 }
  }],
  timeLimit: { type: Number, default: 0 },
}, { _id: false });

// Course Badge Schema
const BadgeSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  color: { type: String, default: "#4F46E5" }
}, { _id: false });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  duration: { type: String, default: "" },
  estimatedMinutes: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner"
  },
  category: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  isLiteVersion: { type: Boolean, default: false },

  instructor: {
    type: InstructorSchema,
    required: true
  },

  pricing: {
    type: PricingSchema,
    default: () => ({})
  },

  subscription: {
    type: SubscriptionSchema,
    default: () => ({})
  },

  learningPoints: { type: [String], default: [] },
  modules: { type: [ModuleSchema], default: [] },
  
  finalTest: {
    type: FinalTestSchema,
    default: null
  },
  
  badge: {
    type: BadgeSchema,
    default: () => ({})
  },
},
  {
    timestamps: true,
  }
);

CourseSchema.virtual("priceAmount").get(function () {
  if (
    this.pricing &&
    typeof this.pricing.amount === "number" &&
    !Number.isNaN(this.pricing.amount)
  ) {
    return this.pricing.amount;
  }

  if (this._doc && typeof this._doc.priceAmount === "number") {
    return this._doc.priceAmount;
  }

  return 0;
});

CourseSchema.virtual("isFree").get(function () {
  const price = this.priceAmount;
  return this.isLiteVersion || price === 0;
});

CourseSchema.virtual("totalLessons").get(function () {
  const modules = Array.isArray(this.modules) ? this.modules : [];
  return modules.reduce((total, module) => {
    let count = 0;
    if (module.learningMaterials) {
      count += (module.learningMaterials.readings?.length || 0);
      count += (module.learningMaterials.podcasts?.length || 0);
      count += (module.learningMaterials.videos?.length || 0);
    }
    count += (module.lessons?.length || 0);
    return total + count;
  }, 0);
});

CourseSchema.set("toJSON", { virtuals: true });
CourseSchema.set("toObject", { virtuals: true });

CourseSchema.index({
  title: "text",
  description: "text",
  category: "text",
});
CourseSchema.index({ difficulty: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ "pricing.amount": 1 });
CourseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Course", CourseSchema);