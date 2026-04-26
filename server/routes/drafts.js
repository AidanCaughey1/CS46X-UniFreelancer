const express = require("express");
const router = express.Router();
const Draft = require("../models/DraftModel");
const User = require("../models/UserModel");
const { protect } = require("../middleware/authMiddleware");

// GET /api/academy/drafts
// Fetch all drafts for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const drafts = await Draft.find({ instructorId: req.user._id }).sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
});

// GET /api/academy/drafts/:id
// Fetch a specific draft
router.get("/:id", protect, async (req, res) => {
  try {
    const draft = await Draft.findOne({ _id: req.params.id, instructorId: req.user._id });
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    
    res.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ error: "Failed to fetch draft" });
  }
});

// POST /api/academy/drafts
// Create a new draft
router.post("/", protect, async (req, res) => {
  try {
    const { contentType, contentData } = req.body;
    
    if (!['course', 'tutorial', 'seminar'].includes(contentType)) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const draft = new Draft({
      instructorId: req.user._id,
      contentType,
      contentData: contentData || {},
      lastSavedAt: new Date()
    });

    await draft.save();
    res.status(201).json(draft);
  } catch (error) {
    console.error("Error creating draft:", error);
    res.status(500).json({ error: "Failed to create draft" });
  }
});

// PUT /api/academy/drafts/:id
// Update an existing draft (auto-save)
router.put("/:id", protect, async (req, res) => {
  try {
    const { contentData } = req.body;

    const draft = await Draft.findOneAndUpdate(
      { _id: req.params.id, instructorId: req.user._id },
      { 
        $set: { 
          contentData,
          lastSavedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!draft) return res.status(404).json({ error: "Draft not found" });
    
    res.json(draft);
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ error: "Failed to update draft" });
  }
});

// DELETE /api/academy/drafts/:id
// Delete a draft
router.delete("/:id", protect, async (req, res) => {
  try {
    const draft = await Draft.findOneAndDelete({ _id: req.params.id, instructorId: req.user._id });
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    
    res.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ error: "Failed to delete draft" });
  }
});

module.exports = router;
