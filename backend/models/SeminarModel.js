const mongoose = require("mongoose");

const SeminarSchema = new mongoose.Schema({
  // Basic seminar info
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String }, // e.g. "1.5 hours"

  type: { 
    type: String, 
    enum: ["Live Now", "Recorded", "Hybrid"], 
    default: "Live Now" 
  },

  thumbnail: { type: String },

  // Speaker section
  speaker: {
    name: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String }
  },

  // Scheduling info
  schedule: {
    date: { type: String },  // YYYY-MM-DD
    time: { type: String },  // HH:MM
    joinUrl: { type: String }
  },

  createdAt: { type: Date, default: Date.now }
});

// Indexes to support upcoming/recorded filters and search
SeminarSchema.index({ "schedule.date": 1 });
SeminarSchema.index({ type: 1 });
SeminarSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Seminar", SeminarSchema);
