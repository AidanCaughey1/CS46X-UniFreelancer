const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
  points: { type: Number, required: true },
  maxPoints: { type: Number, required: true },
  comment: { type: String, default: "" }
}, { _id: false });

const AssignmentSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  courseName: { type: String, required: true },

  module: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  moduleName: { type: String, required: true },

  lessonId: { type: String, required: true },
  assignmentTitle: { type: String, required: true },
  assignmentType: {
    type: String,
    enum: ["question-based", "part-based"],
    default: "part-based"
  },

  assignmentData: {
    parts: [{
      partNumber: Number,
      title: String,
      instructions: String
    }],
    gradingCriteria: [{
      name: String,
      points: Number
    }]
  },

  submittedAt: { type: Date, default: Date.now },

  partAnswers: {
    type: Map,
    of: String,
    default: {}
  },

  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  fileUrl: { type: String, default: "" },

  status: {
    type: String,
    enum: ["pending", "graded"],
    default: "pending"
  },
  grades: {
    type: Map,
    of: GradeSchema,
    default: {}
  },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  passed: { type: Boolean, default: false },
  passingScore: { type: Number, default: 70 },
  overallFeedback: { type: String, default: "" },
  gradedAt: { type: Date },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  aiSuggestion: {
    createdAt: { type: Date },
    model: { type: String, default: "" },
    grades: {
      type: Map,
      of: GradeSchema,
      default: {}
    },
    overallFeedback: { type: String, default: "" },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    notes: { type: [String], default: [] }
  }
}, {
  timestamps: true
});

AssignmentSubmissionSchema.index({ instructor: 1, status: 1 });
AssignmentSubmissionSchema.index({ student: 1, course: 1 });
AssignmentSubmissionSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);