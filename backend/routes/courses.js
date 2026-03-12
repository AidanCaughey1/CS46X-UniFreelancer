const express = require("express");
const Course = require("../models/CourseModel");
const User = require("../models/UserModel");
const { protect } = require("../middleware/authMiddleware");
const testCourses = require("../data/courses.json");

const router = express.Router();

// -------------------------------------
// GET all courses
// -------------------------------------
router.get("/", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "test" && !process.env.MONGO_URI) {
      return res.json(testCourses);
    }

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
    if (process.env.NODE_ENV === "test" && !process.env.MONGO_URI) {
      const course = testCourses.find((item) => item._id === req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.json(course);
    }

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
// CREATE a course
// -------------------------------------
router.post("/", protect, async (req, res) => {
  try {
    console.log("Incoming Create Course Request:");
    console.log(JSON.stringify(req.body, null, 2));

    const instructor = await User.findById(req.user._id).select(
      "firstName lastName email accountType"
    );

    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    if (instructor.accountType !== "instructor") {
      return res.status(403).json({ error: "Only instructors can create courses" });
    }

    const course = new Course({
      ...req.body,
      instructor: {
        _id: instructor._id,
        name: `${instructor.firstName} ${instructor.lastName}`.trim(),
        email: instructor.email,
        title: req.body.instructor?.title || "Instructor",
        bio: req.body.instructor?.bio || "",
        avatar: req.body.instructor?.avatar || "",
      },
    });
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
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.instructor?._id?.toString() !== req.user._id.toString()) {
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
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.instructor?._id?.toString() !== req.user._id.toString()) {
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
