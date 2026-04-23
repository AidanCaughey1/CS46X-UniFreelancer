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

module.exports = mongoose.model("Draft", DraftSchema);
