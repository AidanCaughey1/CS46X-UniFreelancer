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
  type: {
    type: String,
    enum: ["one-time", "subscription"],
    default: "one-time"
  },
}, { _id: false });

const SubscriptionSchema = new mongoose.Schema({
  isSubscriptionCourse: { type: Boolean, default: false },
  tier: { type: String, default: "" }
}, { _id: false });

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },

  // Content types
  videoUrl: { type: String, default: "" },
  articleContent: { type: String, default: "" },
  pdfUrl: { type: String, default: "" },

  // Quiz placeholder for future
  hasQuiz: { type: Boolean, default: false },
  quizData: { type: Object, default: null },

  learningPoints: { type: [String], default: [] },
  duration: { type: String, default: "" },
  estimatedMinutes: { type: Number, default: 0 },
  thumbnail: { type: String, default: "" },

  order: { type: Number, default: 0 }
}, { _id: true });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  duration: { type: String, default: "" },
  estimatedMinutes: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner"
  },
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

  learningPoints: { type: [String], default: [] },
  modules: { type: [ModuleSchema], default: [] },

},
  {
    timestamps: true,
  }
);

CourseSchema.virtual("priceAmount").get(function () {
  // 1) If pricing.amount is set, use that
  if (
    this.pricing &&
    typeof this.pricing.amount === "number" &&
    !Number.isNaN(this.pricing.amount)
  ) {
    return this.pricing.amount;
  }

  // 2) If the raw document (e.g., created via Atlas) has priceAmount, use it
  if (this._doc && typeof this._doc.priceAmount === "number") {
    return this._doc.priceAmount;
  }

  return 0;
});

// Virtual: whether the course counts as free
CourseSchema.virtual("isFree").get(function () {
  const price = this.priceAmount;
  return this.isLiteVersion || price === 0;
});

// Make sure virtuals show up in JSON sent to frontend
CourseSchema.set("toJSON", { virtuals: true });
CourseSchema.set("toObject", { virtuals: true });

// Indexes to support search & filtering (optional but good to add)
CourseSchema.index({
  title: "text",
  description: "text",
  category: "text",
});
CourseSchema.index({ difficulty: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ "pricing.amount": 1 });
CourseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Course", CourseSchema);
