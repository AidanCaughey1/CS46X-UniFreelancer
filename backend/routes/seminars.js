const express = require("express");
const Seminar = require("../models/SeminarModel");
const router = express.Router();

// Get all seminars
router.get("/", async (req, res) => {
  try {
    const seminars = await Seminar.find();
    res.json(seminars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create seminar
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Seminar:", req.body);

    const seminar = new Seminar(req.body);
    const saved = await seminar.save();
    
    res.status(201).json(saved);
  } catch (err) {
    console.error("SEMINAR CREATE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get single seminar
router.get("/:id", async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id);
    if (!seminar) return res.status(404).json({ error: "Seminar not found" });
    res.json(seminar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update seminar
router.put("/:id", async (req, res) => {
  try {
    const updated = await Seminar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete seminar
router.delete("/:id", async (req, res) => {
  try {
    await Seminar.findByIdAndDelete(req.params.id);
    res.json({ message: "Seminar deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
