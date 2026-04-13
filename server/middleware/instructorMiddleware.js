// server/middleware/instructorMiddleware.js
const isInstructor = async (req, res, next) => {
  try {
    if (!req.user || req.user.accountType !== "instructor") {
      return res.status(403).json({ error: "Access denied. Instructor account required." });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { isInstructor };