const express = require("express");
const Podcast = require("../models/PodcastModel");

const router = express.Router();

// GET all podcasts
router.get("/", async (req, res) => {
  try {
    const podcasts = await Podcast.find();
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single podcast
router.get("/:id", async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: "Podcast not found" });
    res.json(podcast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE podcast
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Podcast Create Request:");
    console.log(JSON.stringify(req.body, null, 2));

    const podcast = new Podcast(req.body);
    const saved = await podcast.save();

    console.log("Saved Podcast:", saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error("ERROR CREATING PODCAST:", err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE podcast
router.put("/:id", async (req, res) => {
  try {
    const updated = await Podcast.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Podcast not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE podcast
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Podcast.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Podcast not found" });

    res.json({ message: "Podcast deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
