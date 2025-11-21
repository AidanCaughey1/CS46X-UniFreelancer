const express = require("express");
const Course = require("../models/CourseModel");

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a course
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Create Course Request:");
    console.log(JSON.stringify(req.body, null, 2));

    const course = new Course(req.body);
    const saved = await course.save();

    console.log("Saved Course:", saved);
    res.status(201).json(saved);

  } catch (err) {
    console.error("ERROR CREATING COURSE:", err);
    res.status(400).json({ error: err.message });
  }
});


// UPDATE a course
router.put("/:id", async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Course not found" });
    res.json(updated);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a course
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Course not found" });

    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
