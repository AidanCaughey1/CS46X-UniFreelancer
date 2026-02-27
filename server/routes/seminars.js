const express = require("express");
const jwt = require("jsonwebtoken");
const Seminar = require("../models/SeminarModel");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

const LIVE_BUFFER_MS = 30 * 60 * 1000;

const getSeminarStatus = (seminar, now = Date.now()) => {
  const schedule = seminar?.schedule || {};
  const startAt = schedule.startAt ? new Date(schedule.startAt).getTime() : NaN;
  const endAt = schedule.endAt ? new Date(schedule.endAt).getTime() : NaN;

  if (Number.isNaN(startAt) || Number.isNaN(endAt) || endAt <= startAt) {
    return "Past";
  }

  if (now < startAt - LIVE_BUFFER_MS) return "Future";
  if (now > endAt + LIVE_BUFFER_MS) return "Past";
  return "Live Now";
};

const normalizeSchedule = (schedule = {}) => {
  const normalized = { ...schedule };

  if (schedule.startAt) {
    const start = new Date(schedule.startAt);
    if (Number.isNaN(start.getTime())) {
      throw new Error("Invalid schedule.startAt");
    }
    normalized.startAt = start;
  }

  if (schedule.endAt) {
    const end = new Date(schedule.endAt);
    if (Number.isNaN(end.getTime())) {
      throw new Error("Invalid schedule.endAt");
    }
    normalized.endAt = end;
  }

  if (normalized.startAt && normalized.endAt && normalized.endAt <= normalized.startAt) {
    throw new Error("schedule.endAt must be after schedule.startAt");
  }

  return normalized;
};

// Get all seminars
router.get("/", async (req, res) => {
  try {
    const seminars = await Seminar.find();
    res.json(seminars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create seminar
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Seminar:", req.body);

    const payload = {
      ...req.body,
      ...(req.body.schedule ? { schedule: normalizeSchedule(req.body.schedule) } : {})
    };

    const seminar = new Seminar(payload);
    const saved = await seminar.save();
    
    res.status(201).json(saved);
  } catch (err) {
    console.error("SEMINAR CREATE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get single seminar
router.get("/:id", async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id);
    if (!seminar) return res.status(404).json({ error: "Seminar not found" });
    res.json(seminar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Zoom Meeting SDK signature for seminar join
router.get("/:id/zoom-signature", protect, async (req, res) => {
  try {
    const sdkKey = process.env.ZOOM_MEETING_SDK_KEY;
    const sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET;

    if (!sdkKey || !sdkSecret) {
      return res.status(500).json({ message: "Zoom SDK credentials are not configured" });
    }

    const seminar = await Seminar.findById(req.params.id);
    if (!seminar) {
      return res.status(404).json({ message: "Seminar not found" });
    }

    const meetingNumber = seminar.schedule?.zoomMeetingId;
    if (!meetingNumber) {
      return res.status(400).json({ message: "Zoom meeting ID is missing for this seminar" });
    }

    const requestedMeetingNumber = req.query.meetingNumber;
    if (requestedMeetingNumber && String(requestedMeetingNumber) !== String(meetingNumber)) {
      return res.status(400).json({ message: "Meeting number does not match seminar" });
    }

    const status = getSeminarStatus(seminar);
    if (status !== "Live Now") {
      return res.status(403).json({ message: "Zoom join is only available while this seminar is live" });
    }

    const role = Number(req.query.role ?? 0);
    if (![0, 1].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Use 0 (attendee) or 1 (host)" });
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 2;

    const payload = {
      appKey: sdkKey,
      sdkKey,
      mn: String(meetingNumber),
      role,
      iat,
      exp,
      tokenExp: exp
    };

    const signature = jwt.sign(payload, sdkSecret, { algorithm: "HS256" });

    res.json({ signature, sdkKey });
  } catch (error) {
    console.error("Zoom signature error:", error);
    res.status(500).json({ message: "Error generating Zoom signature" });
  }
});

// Update seminar
router.put("/:id", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      ...(req.body.schedule ? { schedule: normalizeSchedule(req.body.schedule) } : {})
    };

    const updated = await Seminar.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete seminar
router.delete("/:id", async (req, res) => {
  try {
    await Seminar.findByIdAndDelete(req.params.id);
    res.json({ message: "Seminar deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
