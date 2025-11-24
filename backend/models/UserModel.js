const mongoose = require("mongoose");
const bcrypt = require("bcrypt");                    // <-- NEW

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);   // <-- NEW

const UserSchema = new mongoose.Schema({
  // Basic Identity
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 4,
    maxlength: 24,
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: { type: String, required: true }, // now stored as hash

  // User Permissions
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },

  // Learning relationships
  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  completedCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  registeredSeminars: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Seminar" }
  ],

  completedTutorials: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Tutorial" }
  ],

  savedPodcasts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Podcast" }
  ],
},
  {
    timestamps: true,
  }
);

// ------------------------------------------------------
// Password hashing
// ------------------------------------------------------
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

// Fast lookups for login + registration
UserSchema.index({ role: 1 });
UserSchema.index({ enrolledCourses: 1 });
UserSchema.index({ completedCourses: 1 });

module.exports = mongoose.model("User", UserSchema);
