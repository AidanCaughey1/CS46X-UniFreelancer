import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import ImageUpload from "../../../components/ImageUpload";
import "./CreateSeminar.css";

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

const formatDurationLabel = (minutes) => {
  if (!minutes || !Number.isFinite(minutes)) return "";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!remainder) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours} hour${hours > 1 ? "s" : ""} ${remainder} minute${remainder > 1 ? "s" : ""}`;
};

function CreateSeminar() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("basic-info");
  const [highlightDraft, setHighlightDraft] = useState("");
    // Camera state for speaker avatar
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera API not supported in this browser.");
      return;
    }

    try {
      // If already open, reset cleanly
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraOpen(true); // <-- render the <video> first
    } catch (err) {
      console.error("Camera start failed:", err);
      setCameraError(
        err?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser."
          : "Unable to access camera. Make sure a camera is available and not in use."
      );
      stopCamera();
    }
  };

  React.useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!isCameraOpen || !video || !stream) return;

    video.srcObject = stream;

    const play = async () => {
      try {
        await video.play();
      } catch (e) {
        // Some browsers require user interaction; still OK
        console.warn("Video play() blocked:", e);
      }
    };

    // Wait for metadata so videoWidth/videoHeight are available
    video.onloadedmetadata = play;

    return () => {
      if (video) video.onloadedmetadata = null;
    };
  }, [isCameraOpen]);

  const captureSpeakerAvatar = () => {
  const video = videoRef.current;
  if (!video) return;

  const w = video.videoWidth;
  const h = video.videoHeight;

  if (!w || !h) {
    setCameraError("Camera not ready yet—try again in a moment.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  canvas.toBlob(async (blob) => {
    try {
      if (!blob) throw new Error("Failed to capture image");

      setIsUploadingAvatar(true);
      setCameraError("");

      const form = new FormData();
      form.append("image", blob, "speaker-avatar.png");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: form,
        credentials: "include" // safe even if not required
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setFormData((prev) => ({ ...prev, speakerAvatar: data.url }));

      stopCamera();
    } catch (err) {
      console.error("Speaker avatar upload failed:", err);
      setCameraError(err.message || "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
    }
  }, "image/png", 0.92);
};

  // Cleanup if leaving the page
  React.useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    highlights: [],
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

  const scheduleTimes = getScheduleTimes(formData);
  const calculatedDurationMinutes = scheduleTimes.valid
    ? Math.round((scheduleTimes.endAtLocal.getTime() - scheduleTimes.startAtLocal.getTime()) / 60000)
    : 0;
  const calculatedDurationLabel = formatDurationLabel(calculatedDurationMinutes);

  const steps = [
    { id: "basic-info", label: "Basic Info" },
    { id: "speaker", label: "Speaker" },
    { id: "schedule", label: "Schedule" }
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddHighlight = () => {
    const nextHighlight = highlightDraft.trim();
    if (!nextHighlight) return;

    setFormData((prev) => {
      if (prev.highlights.length >= 3) return prev;
      return { ...prev, highlights: [...prev.highlights, nextHighlight] };
    });

    setHighlightDraft("");
  };

  const handleRemoveHighlight = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, index) => index !== indexToRemove)
    }));
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

    const { startAtLocal, endAtLocal, valid } = getScheduleTimes(formData);
    if (!valid || !startAtLocal || !endAtLocal) {
      alert("Please provide a valid date/time range. End time must be after start time.");
      return;
    }

    const durationMinutes = String(Math.round((endAtLocal.getTime() - startAtLocal.getTime()) / 60000));

    const sourceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      highlights: formData.highlights.map((item) => item.trim()).filter(Boolean).slice(0, 3),
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
                <label>What to Expect (up to 3 bullet points)</label>
                <div className="create-seminar-highlight-entry-row">
                  <input
                    type="text"
                    placeholder="Enter a highlight"
                    value={highlightDraft}
                    onChange={(event) => setHighlightDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    maxLength={160}
                    disabled={formData.highlights.length >= 3}
                  />
                  <button
                    type="button"
                    className="create-seminar-secondary-button create-seminar-highlight-add-btn"
                    onClick={handleAddHighlight}
                    disabled={!highlightDraft.trim() || formData.highlights.length >= 3}
                  >
                    Add
                  </button>
                </div>

                {formData.highlights.length > 0 ? (
                  <div className="create-seminar-highlight-list" role="list">
                    {formData.highlights.map((highlight, index) => (
                      <div className="create-seminar-highlight-item" key={`${highlight}-${index}`} role="listitem">
                        <span>{highlight}</span>
                        <button
                          type="button"
                          className="create-seminar-highlight-remove-btn"
                          onClick={() => handleRemoveHighlight(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <p className="create-seminar-highlight-hint">
                  {formData.highlights.length}/3 added
                </p>
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

              {/* Camera controls (right under paste image url / ImageUpload) */}
              <div className="create-seminar-camera">
                {!isCameraOpen ? (
                  <button
                    type="button"
                    className="create-seminar-secondary-button"
                    onClick={startCamera}
                  >
                    Use Camera
                  </button>
                ) : (
                  <div className="create-seminar-camera-panel">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="create-seminar-camera-preview"
                    />

                    <div className="create-seminar-camera-actions">
                      <button
                        type="button"
                        className="create-seminar-primary-button"
                        onClick={captureSpeakerAvatar}
                      >
                        Capture
                      </button>
                    
                      <button
                        type="button"
                        className="create-seminar-secondary-button"
                        onClick={stopCamera}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {cameraError ? <p className="create-seminar-camera-error">{cameraError}</p> : null}
              </div>
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
                <label>Duration</label>
                <input
                  type="text"
                  value={calculatedDurationLabel}
                  placeholder="Set start and end time"
                  readOnly
                />
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
