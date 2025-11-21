const mongoose = require("mongoose");

const InstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: "" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" }
}, { _id: false });

const PricingSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  type: { type: String, default: "one-time" }
}, { _id: false });

const SubscriptionSchema = new mongoose.Schema({
  isSubscriptionCourse: { type: Boolean, default: false },
  tier: { type: String, default: "" }
}, { _id: false });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  duration: { type: String, default: "" },
  difficulty: { type: String, default: "Beginner" },
  category: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  isLiteVersion: { type: Boolean, default: false },

  instructor: { 
    type: InstructorSchema, 
    required: true 
  },

  pricing: { 
    type: PricingSchema, 
    default: () => ({}) 
  },

  subscription: { 
    type: SubscriptionSchema, 
    default: () => ({}) 
  },

  learningPoints: { type: Array, default: [] },
  modules: { type: Array, default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Course", CourseSchema);
