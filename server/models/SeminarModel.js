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

  // Up to 3 creator-defined highlights shown as bullet points
  highlights: {
    type: [{ type: String, trim: true, maxlength: 160 }],
    default: [],
    validate: {
      validator: (items) => Array.isArray(items) && items.length <= 3,
      message: "A seminar can have at most 3 highlights"
    }
  },

  // Scheduling info
  schedule: {
    date: { type: String },  // Legacy: YYYY-MM-DD
    time: { type: String },  // Legacy: HH:MM
    joinUrl: { type: String },
    startAt: { type: Date },
    endAt: { type: Date },
    sourceTimezone: { type: String },
    zoomMeetingId: { type: String },
    zoomPassword: { type: String }
  },

  createdAt: { type: Date, default: Date.now }
});

// Indexes to support upcoming/recorded filters and search
SeminarSchema.index({ "schedule.date": 1 });
SeminarSchema.index({ type: 1 });
SeminarSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Seminar", SeminarSchema);
