const express = require('express');
const router = express.Router();
const Course = require('../models/CourseModel');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const User = require('../models/UserModel');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if user is an instructor
const isInstructor = async (req, res, next) => {
  try {
    // req.user is already set by the protect middleware
    if (!req.user || req.user.accountType !== 'instructor') {
      return res.status(403).json({ error: 'Access denied. Instructor account required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------
// GET instructor dashboard stats
// -------------------------------------
router.get('/dashboard/stats', protect, isInstructor, async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Get all courses by this instructor
    const courses = await Course.find({ 'instructor._id': instructorId });
    const courseIds = courses.map(c => c._id);

    // Count total students (unique enrollments across all courses)
    const allEnrolledUsers = await User.find({
      enrolledCourses: { $in: courseIds }
    });
    const totalStudents = allEnrolledUsers.length;

    // Count pending submissions
    const pendingCount = await AssignmentSubmission.countDocuments({
      instructor: instructorId,
      status: 'pending'
    });

    // Count total graded submissions
    const gradedCount = await AssignmentSubmission.countDocuments({
      instructor: instructorId,
      status: 'graded'
    });

    // Calculate average grade across all graded submissions
    const gradedSubmissions = await AssignmentSubmission.find({
      instructor: instructorId,
      status: 'graded'
    });

    let avgGrade = 0;
    if (gradedSubmissions.length > 0) {
      const totalPercentage = gradedSubmissions.reduce((sum, sub) => {
        return sum + (sub.totalScore / sub.maxScore) * 100;
      }, 0);
      avgGrade = Math.round(totalPercentage / gradedSubmissions.length);
    }

    res.json({
      totalCourses: courses.length,
      totalStudents,
      pendingSubmissions: pendingCount,
      totalGraded: gradedCount,
      averageGrade: avgGrade
    });

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET all instructor's courses
// -------------------------------------
router.get('/courses', protect, isInstructor, async (req, res) => {
  try {
    const instructorId = req.user._id;

    const courses = await Course.find({ 'instructor._id': instructorId })
      .sort({ createdAt: -1 });

    // For each course, get enrollment count and pending submissions
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await User.countDocuments({
          enrolledCourses: course._id
        });

        const pendingCount = await AssignmentSubmission.countDocuments({
          course: course._id,
          status: 'pending'
        });

        return {
          ...course.toObject(),
          enrolledCount,
          pendingSubmissions: pendingCount
        };
      })
    );

    res.json(coursesWithStats);

  } catch (err) {
    console.error('Error fetching instructor courses:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET pending submissions (FIXED - only one now)
// -------------------------------------
router.get('/submissions/pending', protect, isInstructor, async (req, res) => {
  try {
    console.log('Fetching pending submissions for instructor:', req.user._id);

    const submissions = await AssignmentSubmission.find({
      instructor: req.user._id,
      status: 'pending'
    })
    .populate('student', 'firstName lastName email avatar')
    .sort({ submittedAt: -1 });

    console.log('Found pending submissions:', submissions.length);

    res.json(submissions);

  } catch (err) {
    console.error('Error fetching pending submissions:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET all submissions (graded + pending)
// -------------------------------------
router.get('/submissions', protect, isInstructor, async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { courseId, status } = req.query;

    const query = { instructor: instructorId };
    if (courseId) query.course = courseId;
    if (status) query.status = status;

    const submissions = await AssignmentSubmission.find(query)
      .sort({ submittedAt: -1 })
      .populate('student', 'firstName lastName email avatar')
      .populate('course', 'title thumbnail');

    res.json(submissions);

  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET single submission for grading
// -------------------------------------
// GET single submission for grading
router.get('/submissions/:id', protect, isInstructor, async (req, res) => {
  try {
    console.log('\n=== FETCHING SUBMISSION ===');
    console.log('Submission ID:', req.params.id);
    
    const submission = await AssignmentSubmission.findById(req.params.id)
      .populate('student', 'firstName lastName email avatar')
      .populate('course', 'title');

    console.log('Submission found:', submission ? 'YES' : 'NO');

    if (!submission) {
      console.log('❌ Submission not found');
      return res.status(404).json({ error: 'Submission not found' });
    }

    console.log('Submission data:', {
      student: submission.student,
      course: submission.course,
      assignmentType: submission.assignmentType,
      hasAnswers: !!submission.answers,
      hasPartAnswers: !!submission.partAnswers
    });

    // Verify this submission belongs to this instructor
    if (submission.instructor.toString() !== req.user._id.toString()) {
      console.log('❌ Access denied - wrong instructor');
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('✅ Returning submission to frontend');
    res.json(submission);

  } catch (err) {
    console.error('\n❌ ERROR FETCHING SUBMISSION:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// POST grade submission
// -------------------------------------
router.post('/submissions/:id/grade', protect, isInstructor, async (req, res) => {
  try {
    const { grades, overallFeedback } = req.body;

    const submission = await AssignmentSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Verify this submission belongs to this instructor
    if (submission.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate total score
    let totalScore = 0;
    Object.values(grades).forEach(grade => {
      totalScore += grade.points;
    });

    // Calculate if passed (based on percentage)
    const percentage = (totalScore / submission.maxScore) * 100;
    const passed = percentage >= submission.passingScore;

    // Update submission
    submission.grades = grades;
    submission.totalScore = totalScore;
    submission.passed = passed;
    submission.overallFeedback = overallFeedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await submission.save();

    res.json({
      message: 'Submission graded successfully',
      submission
    });

  } catch (err) {
    console.error('Error grading submission:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET students for a specific course
// -------------------------------------
router.get('/courses/:courseId/students', protect, isInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify the course belongs to this instructor
    const course = await Course.findById(courseId);
    if (!course || course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all enrolled students
    const students = await User.find({
      enrolledCourses: courseId
    }).select('firstName lastName username email avatar enrolledAt');

    // For each student, get their progress
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        // Get their submissions for this course
        const submissions = await AssignmentSubmission.find({
          student: student._id,
          course: courseId
        });

        const totalSubmissions = submissions.length;
        const gradedSubmissions = submissions.filter(s => s.status === 'graded');
        const avgGrade = gradedSubmissions.length > 0
          ? Math.round(
              gradedSubmissions.reduce((sum, s) => sum + (s.totalScore / s.maxScore) * 100, 0) / 
              gradedSubmissions.length
            )
          : 0;

        return {
          ...student.toObject(),
          name: student.firstName && student.lastName 
            ? `${student.firstName} ${student.lastName}` 
            : student.username,
          totalSubmissions,
          gradedSubmissions: gradedSubmissions.length,
          averageGrade: avgGrade
        };
      })
    );

    res.json(studentsWithProgress);

  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET course stats
// -------------------------------------
router.get('/courses/:courseId/stats', protect, isInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const enrolledCount = await User.countDocuments({
      enrolledCourses: courseId
    });

    const submissions = await AssignmentSubmission.find({
      course: courseId
    });

    const pendingCount = submissions.filter(s => s.status === 'pending').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;
    
    const gradedSubmissions = submissions.filter(s => s.status === 'graded');
    const avgGrade = gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((sum, s) => sum + (s.totalScore / s.maxScore) * 100, 0) / 
          gradedSubmissions.length
        )
      : 0;

    res.json({
      enrolledStudents: enrolledCount,
      totalSubmissions: submissions.length,
      pendingSubmissions: pendingCount,
      gradedSubmissions: gradedCount,
      averageGrade: avgGrade,
      passRate: gradedSubmissions.length > 0
        ? Math.round((gradedSubmissions.filter(s => s.passed).length / gradedSubmissions.length) * 100)
        : 0
    });

  } catch (err) {
    console.error('Error fetching course stats:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;