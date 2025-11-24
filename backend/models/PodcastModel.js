const mongoose = require("mongoose");

const PodcastSchema = new mongoose.Schema({
  // BASIC INFO
  title: { type: String, required: true },
  description: { type: String, required: true },

  duration: { type: String },        // "45 min"
  category: { type: String },        // "Business", "Marketing", etc.
  thumbnail: { type: String },       // Image URL

  // SPEAKER / HOST
  speaker: { type: String },         // Host name

  // AUDIO FILE OR LINK
  audioUrl: { type: String },        // mp3, Spotify, etc.

  // WHEN PODCAST WAS RELEASED
  publishedAt: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes to support browsing & search
PodcastSchema.index({ category: 1 });
PodcastSchema.index({ publishedAt: -1 });
PodcastSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Podcast", PodcastSchema);
