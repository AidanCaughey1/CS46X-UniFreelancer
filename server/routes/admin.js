const express = require("express");
const User = require("../models/UserModel");
const AdminAuditLog = require("../models/AdminAuditLogModel");
const { protect, authorizeAccountTypes } = require("../middleware/authMiddleware");

const router = express.Router();

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.use(protect, authorizeAccountTypes("admin"));

router.get("/audit-logs", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const action = String(req.query.action || "").trim();
    const actor = String(req.query.actor || "").trim();
    const target = String(req.query.target || "").trim();
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();
    const sortBy = String(req.query.sortBy || "createdAt").trim();
    const sortOrder = String(req.query.sortOrder || "desc").trim().toLowerCase();

    const andClauses = [];

    if (action) {
      andClauses.push({ action });
    }

    if (actor) {
      const regex = new RegExp(escapeRegex(actor), "i");
      andClauses.push({
        $or: [
          { "actor.email": regex },
          { "actor.username": regex },
          { "actor.identifier": regex },
        ],
      });
    }

    if (target) {
      const regex = new RegExp(escapeRegex(target), "i");
      andClauses.push({
        $or: [
          { "target.email": regex },
          { "target.username": regex },
          { "target.tutorialId": regex },
        ],
      });
    }

    const createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) {
        createdAt.$gte = fromDate;
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        createdAt.$lte = toDate;
      }
    }

    if (Object.keys(createdAt).length > 0) {
      andClauses.push({ createdAt });
    }

    const query = andClauses.length > 0 ? { $and: andClauses } : {};
    const allowedLogSortFields = new Set(["createdAt", "action", "actor.email", "target.email"]);
    const safeSortField = allowedLogSortFields.has(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;
    const sort = { [safeSortField]: safeSortOrder, _id: -1 };

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      AdminAuditLog.countDocuments(query),
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

router.get("/audit-logs/critical", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);

    const criticalLogs = await AdminAuditLog.find({
      action: { $in: ["PROMOTE_USER", "DEMOTE_USER", "CHANGE_ACCOUNT_TYPE"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ logs: criticalLogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 50);
    const search = String(req.query.search || "").trim();
    const accountType = String(req.query.accountType || "").trim().toLowerCase();
    const sortBy = String(req.query.sortBy || "createdAt").trim();
    const sortOrder = String(req.query.sortOrder || "desc").trim().toLowerCase();

    const query = {};
    if (["student", "instructor", "admin"].includes(accountType)) {
      query.accountType = accountType;
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { email: regex },
        { username: regex },
        { firstName: regex },
        { lastName: regex },
      ];
    }

    const allowedUserSortFields = new Set(["createdAt", "firstName", "username", "email", "accountType"]);
    const safeSortField = allowedUserSortFields.has(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;
    const sort = { [safeSortField]: safeSortOrder, _id: -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("firstName lastName username email accountType createdAt")
        .sort(sort)
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

router.get("/user-stats", async (req, res) => {
  try {
    const [totalUsers, students, instructors, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountType: "student" }),
      User.countDocuments({ accountType: "instructor" }),
      User.countDocuments({ accountType: "admin" }),
    ]);

    res.json({
      roleCounts: {
        student: students,
        instructor: instructors,
        admin: admins,
      },
      totalUsers,
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
