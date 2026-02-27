import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import ImageUpload from "../../../components/ImageUpload";
import "./CreateSeminar.css";

const parseDurationMinutes = (value) => {
  if (!value) return "";
  const normalized = String(value).trim();
  const numberMatch = normalized.match(/^(\d+)$/);
  if (!numberMatch) return null;
  const minutes = Number(numberMatch[1]);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return String(minutes);
};

const getScheduleTimes = ({ date, startTime, endTime }) => {
  if (!date || !startTime || !endTime) {
    return { startAtLocal: null, endAtLocal: null, valid: false };
  }

  const startAtLocal = new Date(`${date}T${startTime}`);
  const endAtLocal = new Date(`${date}T${endTime}`);

  if (Number.isNaN(startAtLocal.getTime()) || Number.isNaN(endAtLocal.getTime())) {
    return { startAtLocal: null, endAtLocal: null, valid: false };
  }

  return {
    startAtLocal,
    endAtLocal,
    valid: endAtLocal > startAtLocal
  };
};

function CreateSeminar() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("basic-info");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    thumbnail: "",
    speakerName: "",
    speakerBio: "",
    speakerAvatar: "",
    date: "",
    startTime: "",
    endTime: "",
    zoomMeetingId: "",
    zoomPassword: ""
  });

  const steps = [
    { id: "basic-info", label: "Basic Info" },
    { id: "speaker", label: "Speaker" },
    { id: "schedule", label: "Schedule" }
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "duration") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isStepValid = (stepId) => {
    if (stepId === "basic-info") {
      return formData.title.trim() && formData.description.trim();
    }

    if (stepId === "speaker") {
      return formData.speakerName.trim();
    }

    if (stepId === "schedule") {
      if (!formData.date || !formData.startTime || !formData.endTime) return false;
      if (!formData.zoomMeetingId.trim() || !formData.zoomPassword.trim()) return false;
      return getScheduleTimes(formData).valid;
    }

    return true;
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      if (currentStep === "basic-info") {
        alert("Please fill in title and description before continuing.");
      } else if (currentStep === "speaker") {
        alert("Please provide the speaker name before continuing.");
      }
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const durationMinutes = parseDurationMinutes(formData.duration);
    if (durationMinutes === null) {
      alert("Duration must be a number of minutes (e.g., 45) or left blank.");
      return;
    }

    const { startAtLocal, endAtLocal, valid } = getScheduleTimes(formData);
    if (!valid || !startAtLocal || !endAtLocal) {
      alert("Please provide a valid date/time range. End time must be after start time.");
      return;
    }

    const sourceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      duration: durationMinutes,
      thumbnail: formData.thumbnail,
      speaker: {
        name: formData.speakerName.trim(),
        bio: formData.speakerBio.trim(),
        avatar: formData.speakerAvatar
      },
      schedule: {
        date: formData.date,
        time: formData.startTime,
        startAt: startAtLocal.toISOString(),
        endAt: endAtLocal.toISOString(),
        sourceTimezone,
        zoomMeetingId: formData.zoomMeetingId.trim(),
        zoomPassword: formData.zoomPassword.trim()
      }
    };

    try {
      const response = await fetch("/api/academy/seminars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create seminar.");
      }

      alert("Seminar created successfully!");
      navigate("/academy/seminars");
    } catch (error) {
      console.error("Error creating seminar:", error);
      alert(error.message || "An unexpected error occurred while creating the seminar.");
    }
  };

  return (
    <div className="create-seminar-page">
      <div className="create-seminar-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>

        <h1>Create New Seminar</h1>
        <p className="create-seminar-page-subtitle">Fill in the details to schedule a new live seminar</p>

        <div className="create-seminar-steps-indicator">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`create-seminar-step ${currentStepIndex === index ? "active" : ""} ${
                currentStepIndex > index ? "completed" : ""
              }`}
            >
              <div className="create-seminar-step-number">{index + 1}</div>
              <div className="create-seminar-step-label">{step.label}</div>
            </div>
          ))}
        </div>

        <div className="create-seminar-form-container">
          {currentStep === "basic-info" && (
            <div className="create-seminar-form-section">
              <h2>Seminar Information</h2>
              <p className="create-seminar-section-subtitle">Basic details about your seminar</p>

              <div className="create-seminar-form-group">
                <label>Seminar Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Building Your Freelance Brand"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="create-seminar-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe what attendees will learn in this seminar..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="create-seminar-form-group">
                <label>Duration (in Minutes)</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="Minutes only (e.g., 45)"
                  value={formData.duration}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyDown={(event) => {
                    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
                    if (allowedKeys.includes(event.key)) return;
                    if (/^[0-9]$/.test(event.key)) return;
                    event.preventDefault();
                  }}
                  onPaste={(event) => {
                    const paste = event.clipboardData.getData("text");
                    if (!/^[0-9]*$/.test(paste)) {
                      event.preventDefault();
                    }
                  }}
                />
              </div>

              <ImageUpload
                value={formData.thumbnail}
                onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
                label="Seminar Thumbnail"
              />
            </div>
          )}

          {currentStep === "speaker" && (
            <div className="create-seminar-form-section">
              <h2>Speaker Information</h2>
              <p className="create-seminar-section-subtitle">Details about the seminar speaker</p>

              <div className="create-seminar-form-group">
                <label>Speaker Name *</label>
                <input
                  type="text"
                  name="speakerName"
                  placeholder="e.g., Jane Doe"
                  value={formData.speakerName}
                  onChange={handleChange}
                />
              </div>

              <div className="create-seminar-form-group">
                <label>Speaker Bio</label>
                <textarea
                  name="speakerBio"
                  placeholder="Brief biography of the speaker..."
                  value={formData.speakerBio}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <ImageUpload
                value={formData.speakerAvatar}
                onChange={(url) => setFormData((prev) => ({ ...prev, speakerAvatar: url }))}
                label="Speaker Avatar"
              />
            </div>
          )}

          {currentStep === "schedule" && (
            <div className="create-seminar-form-section">
              <h2>Schedule</h2>
              <p className="create-seminar-section-subtitle">Set the date, time, and Zoom details</p>

              <div className="create-seminar-form-row">
                <div className="create-seminar-form-group">
                  <label>Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} />
                </div>

                <div className="create-seminar-form-group">
                  <label>Start Time *</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
                </div>

                <div className="create-seminar-form-group">
                  <label>End Time *</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
                </div>
              </div>

              <div className="create-seminar-form-group">
                <label>Zoom Meeting ID *</label>
                <input
                  type="text"
                  name="zoomMeetingId"
                  placeholder="e.g., 12345678901"
                  value={formData.zoomMeetingId}
                  onChange={handleChange}
                />
              </div>

              <div className="create-seminar-form-group">
                <label>Zoom Passcode *</label>
                <input
                  type="text"
                  name="zoomPassword"
                  placeholder="Enter Zoom passcode"
                  value={formData.zoomPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="create-seminar-form-actions">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="create-seminar-secondary-button"
          >
            Previous
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="create-seminar-primary-button"
              disabled={!isStepValid(currentStep)}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="create-seminar-primary-button"
              disabled={!isStepValid("schedule")}
            >
              Create Seminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateSeminar;
