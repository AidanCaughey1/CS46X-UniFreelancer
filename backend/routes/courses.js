const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Create a new course
router.post("/", async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a course by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returns the updated document
    );
    if (!updatedCourse) return res.status(404).json({ error: "Course not found" });
    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a course by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ error: "Course not found" });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

