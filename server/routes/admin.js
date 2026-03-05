const express = require("express");
const User = require("../models/UserModel");
const AdminAuditLog = require("../models/AdminAuditLogModel");
const { protect, authorizeAccountTypes } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorizeAccountTypes("admin"));

router.get("/audit-logs", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);

    const [logs, total] = await Promise.all([
      AdminAuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AdminAuditLog.countDocuments(),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 50);
    const search = String(req.query.search || "").trim();

    const query = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { email: regex },
        { username: regex },
        { firstName: regex },
        { lastName: regex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("firstName lastName username email accountType createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/users/:id/account-type", async (req, res) => {
  try {
    const allowedAccountTypes = ["student", "instructor", "admin"];
    const nextAccountType = String(req.body.accountType || "").trim().toLowerCase();
    const reason = String(req.body.reason || "").trim();

    if (!allowedAccountTypes.includes(nextAccountType)) {
      return res.status(400).json({ error: "Invalid account type" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUser._id.toString() === req.user._id.toString() && nextAccountType !== "admin") {
      return res.status(400).json({ error: "You cannot demote your own admin account" });
    }

    const previousAccountType = targetUser.accountType;

    if (previousAccountType === nextAccountType) {
      return res.status(400).json({ error: "Account type is already set to that value" });
    }

    if (previousAccountType === "admin" && nextAccountType !== "admin") {
      const adminCount = await User.countDocuments({ accountType: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot demote the last admin" });
      }
    }

    targetUser.accountType = nextAccountType;
    await targetUser.save();

    const safeUser = targetUser.toObject();
    delete safeUser.password;

    const action = nextAccountType === "admin"
      ? "PROMOTE_USER"
      : previousAccountType === "admin"
        ? "DEMOTE_USER"
        : "CHANGE_ACCOUNT_TYPE";

    await AdminAuditLog.create({
      action,
      actor: {
        userId: req.user._id,
        email: req.user.email,
        username: req.user.username,
        source: "api",
      },
      target: {
        userId: targetUser._id,
        email: targetUser.email,
        username: targetUser.username,
      },
      before: {
        accountType: previousAccountType,
      },
      after: {
        accountType: nextAccountType,
      },
      reason,
    });

    res.json({ message: "Account type updated", user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
