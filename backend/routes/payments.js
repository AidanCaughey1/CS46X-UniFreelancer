const express = require("express");
const Stripe = require("stripe");
const Course = require("../models/CourseModel");
const User = require("../models/UserModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.warn("Stripe payments disabled: STRIPE_SECRET_KEY not set");
}

router.post("/create-payment-intent", protect, async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: "courseId required" });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.isFree) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { enrolledCourses: course._id },
      });
      return res.json({ free: true });
    }

    if (!stripe) {
      return res.status(501).json({
        error: "Payments are disabled in this environment",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.priceAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        courseId: course._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed" });
  }
});

module.exports = router;
