const express = require('express');
const router = express.Router();
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/CourseModel');
const User = require('../models/UserModel');
const { protect } = require('../middleware/authMiddleware');

// -------------------------------------
// POST - Submit Assignment
// -------------------------------------
router.post('/submit', protect, async (req, res) => {
  try {
    const { courseId, moduleId, assignmentId, answers, fileUrl, submittedAt } = req.body;

    console.log('=== ASSIGNMENT SUBMISSION ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);

    if (!courseId || !moduleId || !assignmentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get course and module to extract assignment data
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const assignment = module.assignment;
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Get student info
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const existingSubmission = await AssignmentSubmission.findOne({
      student: req.user._id,
      course: courseId,
      lessonId: assignmentId,
      status: { $in: ["pending", "graded"] }
    });

    if (existingSubmission) {
      return res.status(400).json({ error: "Assignment already submitted" });
    }

    // Determine if question-based or part-based
    const isQuestionBased = assignment.questions && assignment.questions.length > 0;

    // Create submission with ALL required fields
    const submission = new AssignmentSubmission({
      student: req.user._id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      
      course: courseId,
      courseName: course.title,
      
      module: moduleId,
      moduleName: module.title,
      
      lessonId: assignmentId,
      assignmentTitle: assignment.title || 'Module Assignment',
      assignmentType: isQuestionBased ? 'question-based' : 'part-based',
      
      // Assignment data (for backward compatibility)
      assignmentData: {
        parts: assignment.parts || [],
        gradingCriteria: assignment.gradingCriteria || []
      },
      
      // Submission data
      answers: answers || {},
      partAnswers: new Map(), // Empty for new submissions
      fileUrl: fileUrl || '',
      submittedAt: submittedAt || new Date(),
      
      // Grading info
      maxScore: assignment.totalPoints || 100,
      passingScore: 70,
      status: 'pending',
      
      instructor: course.instructor._id
    });

    await submission.save();
    
    let progress = student.courseProgress.find(
      p => p.courseId.toString() === courseId
    );

    if (!progress) {
      progress = {
        courseId,
        completedLessons: [],
        assignmentSubmissions: [],
        quizResults: [],
        currentModuleId: moduleId || null,
        currentLessonId: assignmentId || null,
        lastAccessedAt: new Date()
      };
      student.courseProgress.push(progress);
    }

    const existingIndex = progress.assignmentSubmissions.findIndex(
      sub => sub.lessonId?.toString() === assignmentId
    );

    const progressSubmission = {
      lessonId: assignmentId,
      textSubmission: "",
      fileUrl: fileUrl || "",
      submittedAt: submittedAt || new Date()
    };

    if (existingIndex >= 0) {
      progress.assignmentSubmissions[existingIndex] = progressSubmission;
    } else {
      progress.assignmentSubmissions.push(progressSubmission);
    }

    if (!progress.completedLessons.some(id => id?.toString() === assignmentId)) {
      progress.completedLessons.push(assignmentId);
    }

    progress.currentModuleId = moduleId || progress.currentModuleId;
    progress.currentLessonId = assignmentId || progress.currentLessonId;
    progress.lastAccessedAt = new Date();

    await student.save();

    console.log('✅ Submission saved:', submission._id);

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });

  } catch (err) {
    console.error('❌ Error submitting assignment:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET - Get student's submission for an assignment
// -------------------------------------
router.get("/:courseId/:assignmentId", protect, async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;

    const submission = await AssignmentSubmission.findOne({
      student: req.user._id,
      course: courseId,
      lessonId: assignmentId
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(submission);

  } catch (err) {
    console.error("Error fetching submission:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
