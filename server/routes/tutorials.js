const express = require("express");
const Tutorial = require("../models/TutorialModel");
const AdminAuditLog = require("../models/AdminAuditLogModel");
const { protect, authorizeAccountTypes } = require("../middleware/authMiddleware");

const router = express.Router();

// GET all tutorials
router.get("/", async (req, res) => {
  try {
    const tutorials = await Tutorial.find();
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single tutorial
router.get("/:id", async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ error: "Tutorial not found" });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE tutorial
router.post("/", protect, authorizeAccountTypes("admin"), async (req, res) => {
  try {
    console.log("Incoming Tutorial Create Request:");
    console.log(JSON.stringify(req.body, null, 2));

    // Auto-populate instructor from the logged-in admin
    if (!req.body.instructor || !req.body.instructor.name) {
      req.body.instructor = {
        name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username || req.user.email
      };
    }

    const tutorial = new Tutorial(req.body);
    const saved = await tutorial.save();

    await AdminAuditLog.create({
      action: "CREATE_TUTORIAL",
      actor: {
        userId: req.user._id,
        email: req.user.email,
        username: req.user.username,
        source: "api",
      },
      target: {
        tutorialId: saved._id,
        title: saved.title,
      },
      reason: String(req.body.auditReason || "").trim(),
    });

    console.log("Saved Tutorial:", saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error("ERROR CREATING TUTORIAL:", err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE tutorial
router.put("/:id", protect, authorizeAccountTypes("admin"), async (req, res) => {
  try {
    const existingTutorial = await Tutorial.findById(req.params.id);
    if (!existingTutorial) return res.status(404).json({ error: "Tutorial not found" });

    const updated = await Tutorial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    await AdminAuditLog.create({
      action: "UPDATE_TUTORIAL",
      actor: {
        userId: req.user._id,
        email: req.user.email,
        username: req.user.username,
        source: "api",
      },
      target: {
        tutorialId: updated._id,
      },
      before: {
        title: existingTutorial.title,
      },
      after: {
        title: updated.title,
      },
      reason: String(req.body.auditReason || "").trim(),
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE tutorial
router.delete("/:id", protect, authorizeAccountTypes("admin"), async (req, res) => {
  try {
    const deleted = await Tutorial.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Tutorial not found" });

    const reason = typeof req.body?.auditReason === "string"
      ? req.body.auditReason.trim()
      : "";

    try {
      await AdminAuditLog.create({
        action: "DELETE_TUTORIAL",
        actor: {
          userId: req.user._id,
          email: req.user.email,
          username: req.user.username,
          source: "api",
        },
        target: {
          tutorialId: deleted._id,
        },
        before: {
          title: deleted.title,
        },
        reason,
      });
    } catch (auditErr) {
      console.error("Audit log failed for tutorial delete:", auditErr.message);
    }

    res.json({ message: "Tutorial deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
