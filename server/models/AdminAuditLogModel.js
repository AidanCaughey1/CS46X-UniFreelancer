const mongoose = require("mongoose");

const AdminAuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      "PROMOTE_USER",
      "DEMOTE_USER",
      "CHANGE_ACCOUNT_TYPE",
      "CREATE_TUTORIAL",
      "UPDATE_TUTORIAL",
      "DELETE_TUTORIAL",
    ],
  },
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    username: { type: String },
    source: { type: String, enum: ["api", "script"], default: "api" },
    identifier: { type: String },
  },
  target: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutorial" },
    email: { type: String },
    username: { type: String },
  },
  before: {
    accountType: { type: String },
    title: { type: String },
  },
  after: {
    accountType: { type: String },
    title: { type: String },
  },
  reason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ action: 1, createdAt: -1 });
AdminAuditLogSchema.index({ "actor.userId": 1, createdAt: -1 });
AdminAuditLogSchema.index({ "target.userId": 1, createdAt: -1 });

module.exports = mongoose.model("AdminAuditLog", AdminAuditLogSchema);
