const express = require("express");
const User = require("../models/UserModel");
const Course = require("../models/CourseModel");
const AssignmentSubmission = require("../models/AssignmentSubmission");
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
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Update last accessed
    progress.lastAccessedAt = new Date();

    // Calculate progress percentage
    const totalLessons = course.modules.reduce((total, module) => {
      return total + (module.lessons?.length || 0);
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
// SUBMIT assignment - UPDATED VERSION
// ============================================
router.post("/:courseId/progress/assignment/:lessonId/submit", protect, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { textSubmission, fileUrl, partAnswers, answers } = req.body;

    console.log("=== ASSIGNMENT SUBMIT START ===");
    console.log("courseId:", courseId);
    console.log("lessonId:", lessonId);
    console.log("req.user._id:", req.user?._id);
    console.log("body:", JSON.stringify(req.body, null, 2));

    const user = await User.findById(req.user._id);
    const course = await Course.findById(courseId);

    if (!course) {
      console.log("Course not found");
      return res.status(404).json({ error: "Course not found" });
    }

    console.log("Course found:", course.title);
    console.log("Course modules:");
    course.modules.forEach((module, idx) => {
      console.log(`  Module ${idx}:`, {
        moduleId: module._id?.toString(),
        title: module.title,
        syntheticAssignmentLessonId: `${module._id}-assignment`,
        hasModuleAssignment: !!module.assignment,
        lessonIds: (module.lessons || []).map(l => ({
          id: l._id?.toString(),
          type: l.type,
          title: l.title
        }))
      });
    });

    let assignmentData = null;
    let moduleName = "";
    let moduleId = null;

    for (const module of course.modules) {
      const syntheticAssignmentLessonId = `${module._id}-assignment`;

      // Case 1: module-level academic assignment
      if (
        module.assignment &&
        (
          syntheticAssignmentLessonId === lessonId ||
          module._id.toString() === lessonId
        )
      ) {
        assignmentData = module.assignment;
        moduleName = module.title;
        moduleId = module._id;
        console.log("Matched module.assignment");
        break;
      }

      // Case 2: actual lesson entry of type assignment
      const lessonMatch = (module.lessons || []).find(
        l => l.type === "assignment" && l._id?.toString() === lessonId
      );

      if (lessonMatch) {
        console.log("Matched module.lessons assignment lesson:", lessonMatch.title);

        // Convert lesson into assignmentData shape expected by AssignmentSubmission
        assignmentData = {
          title: lessonMatch.title || "Assignment",
          instructions: lessonMatch.instructions || "",
          parts: [
            {
              partNumber: 1,
              title: lessonMatch.title || "Assignment Response",
              instructions: lessonMatch.instructions || "Complete this assignment."
            }
          ],
          gradingCriteria: [
            {
              name: "Part 1",
              points: 100
            }
          ]
        };

        moduleName = module.title;
        moduleId = module._id;
        break;
      }
    }

    if (!assignmentData) {
      console.log("Assignment not found for lessonId:", lessonId);
      return res.status(404).json({
        error: "Assignment not found",
        lessonId
      });
    }

    console.log("Resolved assignmentData:", JSON.stringify(assignmentData, null, 2));

    const studentName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      user.email ||
      "Student";

    const hasPartBasedData = Array.isArray(assignmentData.parts) && assignmentData.parts.length > 0;
    const hasQuestionBasedData = Array.isArray(assignmentData.questions) && assignmentData.questions.length > 0;

    const normalizedParts = hasPartBasedData
      ? assignmentData.parts
      : (hasQuestionBasedData
        ? assignmentData.questions.map((question, index) => ({
            partNumber: Number(question.questionNumber) || index + 1,
            title: question.question || `Question ${index + 1}`,
            instructions:
              question.rubric ||
              question.fileRequirements ||
              `Answer the following ${question.type || 'assignment'} question.`,
          }))
        : []);

    const normalizedGradingCriteria = Array.isArray(assignmentData.gradingCriteria) && assignmentData.gradingCriteria.length > 0
      ? assignmentData.gradingCriteria
      : (hasQuestionBasedData
        ? assignmentData.questions.map((question, index) => ({
            name: `Part ${Number(question.questionNumber) || index + 1}`,
            points: Number(question.points) || 0,
          }))
        : []);

    const normalizedAnswerMap = hasQuestionBasedData
      ? normalizedParts.reduce((acc, part) => {
          const key = String(part.partNumber);
          const explicitPartAnswer = partAnswers?.[key] ?? partAnswers?.[part.partNumber];
          const rawAnswer = answers?.[key] ?? answers?.[part.partNumber];

          if (explicitPartAnswer !== undefined && explicitPartAnswer !== null && explicitPartAnswer !== "") {
            acc[key] = explicitPartAnswer;
          } else if (rawAnswer === undefined || rawAnswer === null) {
            acc[key] = "";
          } else if (typeof rawAnswer === "string") {
            acc[key] = rawAnswer;
          } else {
            acc[key] = JSON.stringify(rawAnswer, null, 2);
          }

          return acc;
        }, {})
      : (partAnswers || {});

    const normalizedTextSubmission = textSubmission || Object.entries(normalizedAnswerMap)
      .map(([partNum, answer]) => `Part ${partNum}: ${answer}`)
      .join("\n\n");

    const maxScore = normalizedGradingCriteria.reduce((sum, criteria) => {
      return sum + (Number(criteria.points) || 0);
    }, 0);

    const existingSubmission = await AssignmentSubmission.findOne({
      student: user._id,
      course: courseId,
      lessonId: lessonId
    });

    if (existingSubmission) {
      console.log("Existing submission found");
      return res.status(400).json({
        error: "You have already submitted this assignment. It is pending grading."
      });
    }

    const submission = new AssignmentSubmission({
      student: user._id,
      studentName,
      studentEmail: user.email || "",
      course: courseId,
      courseName: course.title,
      module: moduleId,
      moduleName,
      lessonId,
      assignmentTitle: assignmentData.title || "Assignment",
      assignmentType: hasQuestionBasedData ? "question-based" : "part-based",
      assignmentData: {
        parts: normalizedParts,
        gradingCriteria: normalizedGradingCriteria
      },
      partAnswers: normalizedAnswerMap,
      answers: answers || {},
      fileUrl: fileUrl || "",
      maxScore: maxScore || 100,
      passingScore: 70,
      instructor: course.instructor._id || course.instructor
    });

    console.log("About to save submission:", {
      student: submission.student,
      studentName: submission.studentName,
      course: submission.course,
      module: submission.module,
      lessonId: submission.lessonId,
      instructor: submission.instructor,
      maxScore: submission.maxScore
    });

    await submission.save();
    console.log("Submission saved successfully:", submission._id.toString());

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

    const progressSubmission = {
      lessonId,
      textSubmission: normalizedTextSubmission,
      fileUrl: fileUrl || "",
      submittedAt: new Date()
    };

    const existingIndex = progress.assignmentSubmissions.findIndex(
      sub => sub.lessonId?.toString() === lessonId
    );

    if (existingIndex >= 0) {
      progress.assignmentSubmissions[existingIndex] = progressSubmission;
    } else {
      progress.assignmentSubmissions.push(progressSubmission);
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    progress.lastAccessedAt = new Date();
    await user.save();
    console.log("User progress saved");

    res.json({
      message: "Assignment submitted successfully. Your instructor will grade it soon.",
      submission,
      progress
    });

  } catch (err) {
    console.error("Error submitting assignment:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

// ============================================
// SUBMIT quiz
// ============================================
router.post("/:courseId/progress/quiz/:lessonId/submit", protect, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { answers } = req.body; // array of user answers

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
        // Case-insensitive comparison for short answers
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
    if (passed && !progress.completedLessons.includes(lessonId)) {
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

    const user = await User.findById(req.user._id);

    let progress = user.courseProgress.find(
      p => p.courseId.toString() === courseId
    );

    if (!progress) {
      progress = {
        courseId,
        completedLessons: [],
        assignmentSubmissions: [],
        quizResults: [],
        currentModuleId: moduleId,
        currentLessonId: lessonId,
        lastAccessedAt: new Date()
      };
      user.courseProgress.push(progress);
    } else {
      progress.currentModuleId = moduleId;
      progress.currentLessonId = lessonId;
      progress.lastAccessedAt = new Date();
    }

    await user.save();

    res.json({ message: "Position updated", progress });

  } catch (err) {
    console.error("Error updating position:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
