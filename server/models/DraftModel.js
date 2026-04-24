const mongoose = require("mongoose");

const DraftSchema = new mongoose.Schema({
  instructorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  contentType: { 
    type: String, 
    enum: ['course', 'tutorial', 'seminar'], 
    required: true 
  },
  contentData: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  lastSavedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Fast lookup for dashboard: "all my drafts, newest first"
DraftSchema.index({ instructorId: 1, updatedAt: -1 });

// Auto-delete drafts that haven't been touched in 30 days
DraftSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("Draft", DraftSchema);
