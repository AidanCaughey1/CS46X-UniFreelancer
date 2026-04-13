const express = require("express");
const User = require("../models/UserModel");
const Course = require("../models/CourseModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================
// GET course progress for a user
// ============================================
router.get("/:courseId/progress", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const progress = user.courseProgress.find(
      p => p.courseId.toString() === req.params.courseId
    );

    if (!progress) {
      return res.json({
        courseId: req.params.courseId,
        completedLessons: [],
        progressPercentage: 0,
        currentModuleId: null,
        currentLessonId: null
      });
    }

    res.json(progress);
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// MARK lesson as complete
// ============================================
router.post("/:courseId/progress/lesson/:lessonId/complete", protect, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    
    const user = await User.findById(req.user._id);
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find or create progress entry
    let progress = user.courseProgress.find(
      p => p.courseId.toString() === courseId
    );

    if (!progress) {
      progress = {
        courseId,
        completedLessons: [],
        assignmentSubmissions: [],
        quizResults: [],
        lastAccessedAt: new Date()
      };
      user.courseProgress.push(progress);
    }

    // Add lesson to completed if not already there
    // Convert lessonId to string for comparison since it might be a custom ID like "podcast-0"
    const lessonIdStr = lessonId.toString();
    if (!progress.completedLessons.some(id => id.toString() === lessonIdStr)) {
      progress.completedLessons.push(lessonId);
    }

    // Update last accessed
    progress.lastAccessedAt = new Date();

    // Calculate progress percentage
    const totalLessons = course.modules.reduce((total, module) => {
      let count = module.lessons?.length || 0;
      // Add learning materials
      count += module.learningMaterials?.readings?.length || 0;
      count += module.learningMaterials?.podcasts?.length || 0;
      count += module.learningMaterials?.videos?.length || 0;
      // Add assignment if exists
      if (module.assignment) count += 1;
      return total + count;
    }, 0);

    progress.progressPercentage = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;

    await user.save();

    res.json({
      message: "Lesson marked as complete",
      progress: progress
    });

  } catch (err) {
    console.error("Error marking lesson complete:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SUBMIT quiz
// ============================================
router.post("/:courseId/progress/quiz/:lessonId/submit", protect, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { answers } = req.body;

    const user = await User.findById(req.user._id);
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the quiz lesson
    let quizLesson = null;
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l._id.toString() === lessonId);
      if (lesson) {
        quizLesson = lesson;
        break;
      }
    }

    if (!quizLesson || quizLesson.type !== 'quiz') {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Grade the quiz
    let correctAnswers = 0;
    const totalQuestions = quizLesson.questions.length;

    quizLesson.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      
      if (question.questionType === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      } else if (question.questionType === 'short-answer') {
        if (userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= (quizLesson.passingScore || 70);

    let progress = user.courseProgress.find(
      p => p.courseId.toString() === courseId
    );

    if (!progress) {
      progress = {
        courseId,
        completedLessons: [],
        assignmentSubmissions: [],
        quizResults: [],
        lastAccessedAt: new Date()
      };
      user.courseProgress.push(progress);
    }

    // Save quiz result
    const quizResult = {
      lessonId,
      score,
      totalQuestions,
      correctAnswers,
      answers,
      passed,
      attemptedAt: new Date()
    };

    progress.quizResults.push(quizResult);

    // Mark as complete if passed
    if (passed && !progress.completedLessons.some(id => id.toString() === lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    progress.lastAccessedAt = new Date();

    await user.save();

    res.json({
      message: passed ? "Quiz passed!" : "Quiz completed. Try again!",
      result: quizResult
    });

  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SUBMIT final test
// ============================================
router.post("/:courseId/progress/test/submit", protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body;

    const user = await User.findById(req.user._id);
    const course = await Course.findById(courseId);

    if (!course || !course.finalTest) {
      return res.status(404).json({ error: "Final test not found" });
    }

    // Grade the test
    let correctAnswers = 0;
    const totalQuestions = course.finalTest.questions.length;

    course.finalTest.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= (course.finalTest.passingScore || 70);

    let progress = user.courseProgress.find(
      p => p.courseId.toString() === courseId
    );

    if (!progress) {
      return res.status(400).json({ error: "No progress found for this course" });
    }

    // Update test results
    progress.finalTestScore = score;
    progress.finalTestPassed = passed;
    progress.finalTestAttempts = (progress.finalTestAttempts || 0) + 1;
    progress.lastAccessedAt = new Date();

    // If passed, mark course as complete
    if (passed) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      progress.badgeEarned = true;
      progress.progressPercentage = 100;

      // Add to completedCourses if not already there
      if (!user.completedCourses.includes(courseId)) {
        user.completedCourses.push(courseId);
      }
    }

    await user.save();

    res.json({
      message: passed ? "Congratulations! You've completed the course!" : "Test completed. Keep trying!",
      score,
      passed,
      badgeEarned: passed,
      badge: passed ? course.badge : null
    });

  } catch (err) {
    console.error("Error submitting final test:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// UPDATE current position (for "continue where you left off")
// ============================================
router.post("/:courseId/progress/position", protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleId, lessonId } = req.body;

    console.log('\n=== UPDATE POSITION REQUEST ===');
    console.log('Course ID:', courseId);
    console.log('Module ID:', moduleId);
    console.log('Lesson ID:', lessonId);

    const user = await User.findById(req.user._id);

    let progress = user.courseProgress.find(
      p => p.courseId.toString() === courseId
    );

    if (!progress) {
      // Create new progress entry
      progress = {
        courseId,
        completedLessons: [],
        assignmentSubmissions: [],
        quizResults: [],
        currentModuleId: moduleId || null,
        currentLessonId: lessonId || null,
        lastAccessedAt: new Date()
      };
      user.courseProgress.push(progress);
      console.log('Created new progress entry');
    } else {
      // Update existing progress
      // Store as strings since lessonId might be custom IDs like "podcast-0"
      progress.currentModuleId = moduleId || progress.currentModuleId;
      progress.currentLessonId = lessonId || progress.currentLessonId;
      progress.lastAccessedAt = new Date();
      console.log('Updated existing progress');
    }

    await user.save();
    console.log('Position saved successfully');

    res.json({ message: "Position updated", progress });

  } catch (err) {
    console.error('\n❌ ERROR updating position:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
