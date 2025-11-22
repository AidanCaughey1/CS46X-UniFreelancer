const mongoose = require("mongoose");

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

  password: { type: String, required: true }, // plain text for now

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

module.exports = mongoose.model("User", UserSchema);
