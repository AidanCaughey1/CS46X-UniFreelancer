const mongoose = require("mongoose");

const TutorialSchema = new mongoose.Schema({
  // BASIC INFO
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String },           // "15 min"
  category: { type: String, required: true },
  thumbnail: { type: String },

  // CONTENT
  videoUrl: { type: String },          // YouTube, Vimeo, etc.
  writtenContent: { type: String },    // Long text section

  // Downloadable Resources
  resources: [
    {
      label: { type: String },         // "Worksheet", "Template", etc.
      url: { type: String }            // link to file
    }
  ],

  // META FIELDS
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TutorialSchema.index({ category: 1 });
TutorialSchema.index({ createdAt: -1 });
TutorialSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Tutorial", TutorialSchema);
