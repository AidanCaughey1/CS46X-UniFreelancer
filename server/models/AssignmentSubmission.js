const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  points: { type: Number, required: true },
  maxPoints: { type: Number, required: true },
  comment: { type: String, default: '' }
}, { _id: false });

const AssignmentSubmissionSchema = new mongoose.Schema({
  // Student Info
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },

  // Course Info
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: { type: String, required: true },
  
  module: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  moduleName: { type: String, required: true },
  
  // Assignment Details
  lessonId: { type: String, required: true }, // The generated lesson ID
  assignmentTitle: { type: String, required: true },
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

  // Student Submission
  submittedAt: { type: Date, default: Date.now },
  partAnswers: {
    type: Map,
    of: String,
    default: {}
  },
  fileUrl: { type: String, default: '' },

  // Grading
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'pending'
  },
  grades: {
    type: Map,
    of: GradeSchema,
    default: {}
  },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  passed: { type: Boolean, default: false },
  passingScore: { type: Number, default: 70 }, // percentage
  overallFeedback: { type: String, default: '' },
  gradedAt: { type: Date },
  
  // Instructor
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // AI
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
  },
}, {
  timestamps: true
});

// Index for quick queries
AssignmentSubmissionSchema.index({ instructor: 1, status: 1 });
AssignmentSubmissionSchema.index({ student: 1, course: 1 });
AssignmentSubmissionSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema);