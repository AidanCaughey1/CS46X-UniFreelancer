const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/UserModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/learning/track
 * Body: { courseId, elapsedSec }
 * Requires auth cookie (protect middleware)
 */
router.post("/track", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, elapsedSec } = req.body;

    const sec = Number(elapsedSec);
    if (!Number.isFinite(sec) || sec <= 0) {
      return res.status(400).json({ message: "elapsedSec must be a positive number" });
    }

    // Always update overall time
    const baseUpdate = {
      $inc: { "learning.totalSeconds": sec },
      $set: { "learning.updatedAt": new Date() }
    };

    // If no courseId provided, just update overall
    if (!courseId) {
      await User.updateOne({ _id: userId }, baseUpdate);
      return res.json({ ok: true });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    // 1) Try to increment existing byCourse entry (positional update)
    const updated = await User.updateOne(
      { _id: userId, "learning.byCourse.courseId": courseId },
      {
        ...baseUpdate,
        $inc: {
          ...baseUpdate.$inc,
          "learning.byCourse.$.totalSeconds": sec
        },
        $set: {
          ...baseUpdate.$set,
          "learning.byCourse.$.lastTrackedAt": new Date()
        }
      }
    );

    // 2) If no existing entry, push a new one
    if (updated.matchedCount === 0) {
      await User.updateOne(
        { _id: userId },
        {
          ...baseUpdate,
          $push: {
            "learning.byCourse": {
              courseId,
              totalSeconds: sec,
              lastTrackedAt: new Date()
            }
          }
        }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("learning track error:", err);
    res.status(500).json({ message: "Server error tracking learning time" });
  }
});

/**
 * GET /api/learning/summary
 * Returns totals for dashboard
 */
router.get("/summary", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("learning").lean();

    res.json({
      totalSeconds: user?.learning?.totalSeconds ?? 0,
      byCourse: (user?.learning?.byCourse ?? []).map(x => ({
        courseId: x.courseId,
        totalSeconds: x.totalSeconds
      }))
    });
  } catch (err) {
    console.error("learning summary error:", err);
    res.status(500).json({ message: "Server error fetching learning summary" });
  }
});

module.exports = router;