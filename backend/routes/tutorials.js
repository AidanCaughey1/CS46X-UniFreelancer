const express = require("express");
const Tutorial = require("../models/TutorialModel");

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
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Tutorial Create Request:");
    console.log(JSON.stringify(req.body, null, 2));

    const tutorial = new Tutorial(req.body);
    const saved = await tutorial.save();

    console.log("Saved Tutorial:", saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error("ERROR CREATING TUTORIAL:", err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE tutorial
router.put("/:id", async (req, res) => {
  try {
    const updated = await Tutorial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Tutorial not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE tutorial
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Tutorial.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Tutorial not found" });

    res.json({ message: "Tutorial deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
