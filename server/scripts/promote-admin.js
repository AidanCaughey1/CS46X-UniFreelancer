require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/UserModel");
const AdminAuditLog = require("../models/AdminAuditLogModel");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    const value = args[i + 1];

    if (key === "--email" && value) {
      parsed.email = value;
      i += 1;
      continue;
    }

    if (key === "--username" && value) {
      parsed.username = value;
      i += 1;
      continue;
    }

    if (key === "--by" && value) {
      parsed.by = value;
      i += 1;
      continue;
    }

    if (key === "--reason" && value) {
      parsed.reason = value;
      i += 1;
      continue;
    }

    if (key === "--secret" && value) {
      parsed.secret = value;
      i += 1;
      continue;
    }

    if (key === "--confirm-promote") {
      parsed.confirmPromote = true;
      continue;
    }

    if (key === "--allow-production") {
      parsed.allowProduction = true;
      continue;
    }
  }

  return parsed;
};

const printUsage = () => {
  console.log("Usage:");
  console.log("  node scripts/promote-admin.js --email user@example.com --by maintainer --reason \"Emergency access\" --secret <secret> --confirm-promote");
  console.log("  node scripts/promote-admin.js --username someuser --by maintainer --reason \"Bootstrap first admin\" --secret <secret> --confirm-promote");
  console.log("  Add --allow-production to run in production.");
};

const run = async () => {
  const {
    email,
    username,
    by,
    reason,
    secret,
    confirmPromote,
    allowProduction,
  } = parseArgs();

  const promoteAdminSecret = process.env.PROMOTE_ADMIN_SECRET;

  if ((!email && !username) || (email && username)) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (!by || !String(by).trim()) {
    console.error("Missing required --by argument.");
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (!reason || !String(reason).trim()) {
    console.error("Missing required --reason argument.");
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (!confirmPromote) {
    console.error("Missing --confirm-promote flag.");
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (process.env.NODE_ENV === "production" && !allowProduction) {
    console.error("Refusing to run in production without --allow-production.");
    process.exitCode = 1;
    return;
  }

  if (!promoteAdminSecret) {
    console.error("Missing PROMOTE_ADMIN_SECRET environment variable.");
    process.exitCode = 1;
    return;
  }

  if (!secret || secret !== promoteAdminSecret) {
    console.error("Invalid --secret value.");
    printUsage();
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const query = email
    ? { email: String(email).trim().toLowerCase() }
    : { username: String(username).trim().toLowerCase() };

  const user = await User.findOne(query);
  if (!user) {
    console.error("User not found");
    process.exitCode = 1;
    return;
  }

  console.log(`Found user: ${user.email} (${user.username})`);
  console.log(`Current accountType: ${user.accountType}`);

  if (user.accountType === "admin") {
    console.log("No changes needed: user is already an admin.");
    return;
  }

  const previousAccountType = user.accountType;
  user.accountType = "admin";
  await user.save();

  await AdminAuditLog.create({
    action: "PROMOTE_USER",
    actor: {
      source: "script",
      identifier: String(by).trim(),
    },
    target: {
      userId: user._id,
      email: user.email,
      username: user.username,
    },
    before: {
      accountType: previousAccountType,
    },
    after: {
      accountType: user.accountType,
    },
    reason: String(reason).trim(),
  });

  console.log(`Updated accountType: ${user.accountType}`);
  console.log("Promotion complete.");
};

run()
  .catch((err) => {
    console.error("Failed to promote user:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
