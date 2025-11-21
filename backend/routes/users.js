const express = require("express");
const User = require("../models/UserModel");

const router = express.Router();

// -------------------------------
// Create new user
// -------------------------------
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
    } = req.body;

    // Basic required fields check
    if (!firstName || !lastName || !username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Missing required fields for registration" });
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role,
    });
    await user.save();

    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Login user
// -------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Get user + populate learning info
// -------------------------------
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("enrolledCourses")
      .populate("completedCourses")
      .populate("registeredSeminars")
      .populate("completedTutorials")
      .populate("savedPodcasts");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Enroll in a course
// -------------------------------
router.post("/:id/enroll-course/:courseId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user.enrolledCourses.includes(req.params.courseId)) {
      user.enrolledCourses.push(req.params.courseId);
      await user.save();
    }

    res.json({ message: "Course enrolled", enrolledCourses: user.enrolledCourses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Register for seminar
// -------------------------------
router.post("/:id/register-seminar/:seminarId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user.registeredSeminars.includes(req.params.seminarId)) {
      user.registeredSeminars.push(req.params.seminarId);
      await user.save();
    }

    res.json({ message: "Seminar registered", registeredSeminars: user.registeredSeminars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Complete a tutorial
// -------------------------------
router.post("/:id/complete-tutorial/:tutorialId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user.completedTutorials.includes(req.params.tutorialId)) {
      user.completedTutorials.push(req.params.tutorialId);
      await user.save();
    }

    res.json({ message: "Tutorial completed", completedTutorials: user.completedTutorials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Save a podcast
// -------------------------------
router.post("/:id/save-podcast/:podcastId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user.savedPodcasts.includes(req.params.podcastId)) {
      user.savedPodcasts.push(req.params.podcastId);
      await user.save();
    }

    res.json({ message: "Podcast saved", savedPodcasts: user.savedPodcasts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Complete a course
// -------------------------------
router.post("/:id/complete-course/:courseId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user.completedCourses.includes(req.params.courseId)) {
      user.completedCourses.push(req.params.courseId);
      await user.save();
    }

    res.json({ message: "Course completed", completedCourses: user.completedCourses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Get learning summary
// -------------------------------
router.get("/:id/learning-summary", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("completedCourses");

    if (!user) return res.status(404).json({ message: "User not found" });

    const enrolledCount = user.enrolledCourses.length;
    const completedCount = user.completedCourses.length;

    // Calculate total learning minutes from completed courses
    const totalMinutes = user.completedCourses.reduce((acc, course) => {
      return acc + (course.estimatedMinutes || 0);
    }, 0);

    const learningHours = Math.round(totalMinutes / 60);

    res.json({
      enrolledCount,
      completedCount,
      learningHours
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
