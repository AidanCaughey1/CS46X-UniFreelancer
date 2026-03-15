// server/routes/ai.js
const express = require("express");
const router = express.Router();

const AssignmentSubmission = require("../models/AssignmentSubmission");
const { protect } = require("../middleware/authMiddleware");
const { isInstructor } = require("../middleware/instructorMiddleware");

const {
  generateLearningOutcomesForDraftModule,
  suggestGradesForSubmission,
} = require("../services/ai/ai.service");

router.post("/learning-outcomes/draft", protect, isInstructor, async (req, res) => {
  try {
    const { course, module, count } = req.body;

    if (!course?.title || !course?.description || !module?.title) {
      return res.status(400).json({
        error: "Missing required fields: course.title, course.description, module.title",
      });
    }

    const out = await generateLearningOutcomesForDraftModule({
      course,
      module,
      count: Number(count) || 6,
    });

    res.json(out);
  } catch (err) {
    console.error("AI outcomes error:", err);
    res.status(500).json({ error: "Failed to generate learning outcomes" });
  }
});

router.post("/submissions/:id/suggest-grade", protect, isInstructor, async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findById(req.params.id);

    if (!submission) return res.status(404).json({ error: "Submission not found" });

    if (submission.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const out = await suggestGradesForSubmission({ submission });

    submission.aiSuggestion = {
      createdAt: new Date(),
      model: out.model || "",
      grades: out.grades || {},
      overallFeedback: out.overallFeedback || "",
      totalScore: out.totalScore || 0,
      maxScore: out.maxScore || submission.maxScore || 0,
      percentage: out.percentage || 0,
      notes: out.notes || [],
    };

    await submission.save();

    res.json({
      requestId: out.requestId,
      model: out.model,
      grades: out.grades,
      overallFeedback: out.overallFeedback,
      totalScore: out.totalScore,
      maxScore: out.maxScore,
      percentage: out.percentage,
      notes: out.notes || [],
    });
  } catch (err) {
    console.error("AI grading suggestion error:", err);
    res.status(500).json({ error: "Failed to suggest grades" });
  }
});

module.exports = router;
