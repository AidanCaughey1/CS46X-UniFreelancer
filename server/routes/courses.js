const express = require("express");
const Course = require("../models/CourseModel");
const User = require("../models/UserModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// -------------------------------------
// GET all courses
// -------------------------------------
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET single course by ID
// -------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// CREATE a course - UPDATED
// -------------------------------------
router.post("/", protect, async (req, res) => {
  try {
    console.log("Incoming Create Course Request:");
    console.log(JSON.stringify(req.body, null, 2));

    // Get the instructor's information from the authenticated user
    const instructor = await User.findById(req.user._id).select('firstName lastName email accountType');

    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    // Verify user is an instructor
    if (instructor.accountType !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can create courses' });
    }

    // Prepare course data with instructor information
    const courseData = {
      ...req.body,
      instructor: {
        _id: instructor._id,
        name: `${instructor.firstName} ${instructor.lastName}`,
        email: instructor.email,
        title: req.body.instructor?.title || 'Instructor',
        avatar: req.body.instructor?.avatar || ''
      }
    };

    const course = new Course(courseData);
    const saved = await course.save();

    console.log("Saved Course:", saved);
    res.status(201).json(saved);

  } catch (err) {
    console.error("ERROR CREATING COURSE:", err);
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------
// UPDATE a course
// -------------------------------------
router.put("/:id", protect, async (req, res) => {
  try {
    // Verify the course belongs to this instructor
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if user is the instructor of this course
    if (course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only edit your own courses" });
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("ERROR UPDATING COURSE:", err);
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------
// DELETE a course
// -------------------------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    // Verify the course belongs to this instructor
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if user is the instructor of this course
    if (course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own courses" });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error("ERROR DELETING COURSE:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;