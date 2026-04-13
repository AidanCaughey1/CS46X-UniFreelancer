const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'defaultSecret', {
    expiresIn: '30d',
  });
};

// -------------------------------
// Create new user
// -------------------------------
// -------------------------------
// Create new user
// -------------------------------
router.post("/register", async (req, res) => {
  try {
    const allowedSignupAccountTypes = ["student", "instructor"];
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      accountType, // ADD THIS
    } = req.body;

    const normalizedAccountType = String(accountType || "student").trim().toLowerCase();

    // Basic required fields check
    if (!firstName || !lastName || !username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Missing required fields for registration" });
    }

    // Validate accountType if provided
    if (!allowedSignupAccountTypes.includes(normalizedAccountType)) {
      return res.status(400).json({ message: "Invalid account type. Signup only supports student or instructor." });
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,   // <-- will be hashed by the pre-save hook
      accountType: normalizedAccountType,
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Prevent CSRF
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Strip password before sending back
    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(201).json({
      message: "User registered",
      user: userSafe,
    });
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
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // NEW: strip password before sending back
    const userSafe = user.toObject();
    delete userSafe.password;

    res.json({
      message: "Login successful",
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Logout user
// -------------------------------
router.post("/logout", (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out" });
});

// -------------------------------
// Get current user (Me)
// -------------------------------
router.get("/me", protect, async (req, res) => {
  const user = req.user;
  res.status(200).json(user);
});

// -------------------------------
// Get full profile (Populated)
// -------------------------------
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses")
      .populate("completedCourses")
      .populate("registeredSeminars")
      .populate("completedTutorials")
      .populate("bookmarkedTutorials")
      .populate("savedPodcasts");

    if (!user) return res.status(404).json({ message: "User not found" });

    const userSafe = user.toObject();
    delete userSafe.password;

    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Bookmark a tutorial
// -------------------------------
router.post("/tutorials/:tutorialId/bookmark", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { tutorialId } = req.params;

    if (!user.bookmarkedTutorials.includes(tutorialId)) {
      user.bookmarkedTutorials.push(tutorialId);
      await user.save();
    }

    res.json({
      message: "Tutorial bookmarked",
      bookmarkedTutorials: user.bookmarkedTutorials,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Remove tutorial bookmark
// -------------------------------
router.delete("/tutorials/:tutorialId/bookmark", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { tutorialId } = req.params;
    user.bookmarkedTutorials = user.bookmarkedTutorials.filter(
      (id) => id.toString() !== tutorialId
    );
    await user.save();

    res.json({
      message: "Tutorial unbookmarked",
      bookmarkedTutorials: user.bookmarkedTutorials,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Mark tutorial as completed
// -------------------------------
router.post("/tutorials/:tutorialId/complete", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { tutorialId } = req.params;

    if (!user.completedTutorials.includes(tutorialId)) {
      user.completedTutorials.push(tutorialId);
      await user.save();
    }

    res.json({
      message: "Tutorial completed",
      completedTutorials: user.completedTutorials,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Unmark tutorial as completed
// -------------------------------
router.delete("/tutorials/:tutorialId/complete", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { tutorialId } = req.params;
    user.completedTutorials = user.completedTutorials.filter(
      (id) => id.toString() !== tutorialId
    );
    await user.save();

    res.json({
      message: "Tutorial completion removed",
      completedTutorials: user.completedTutorials,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// Get user + populate learning info
// -------------------------------


// -------------------------------
// Enroll in a course
// -------------------------------
router.post("/enroll/:courseId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.enrolledCourses.includes(req.params.courseId)) {
      user.enrolledCourses.push(req.params.courseId);
      await user.save();
    }

    res.json({
      message: "Course enrolled successfully",
      enrolledCourses: user.enrolledCourses,
    });
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
router.post("/enroll-course/:courseId", protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.enrolledCourses.includes(req.params.courseId)) {
    user.enrolledCourses.push(req.params.courseId);
    await user.save();
  }

  res.json({ message: "Course enrolled" });
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
