import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiVideo } from "react-icons/fi";
import ImageUpload from "../../../components/ImageUpload";
import AlertModal from '../../../components/UI/AlertModal';

const inputClasses =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark";
const textareaClasses =
  "w-full min-h-[180px] rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark";

const getScheduleTimes = ({ date, startTime, endTime }) => {
  if (!date || !startTime || !endTime) {
    return { startAtLocal: null, endAtLocal: null, valid: false };
  }

  const startAtLocal = new Date(`${date}T${startTime}`);
  const endAtLocal = new Date(`${date}T${endTime}`);

  if (
    Number.isNaN(startAtLocal.getTime()) ||
    Number.isNaN(endAtLocal.getTime())
  ) {
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
  const [searchParams] = useSearchParams();
  const draftIdFromUrl = searchParams.get('draftId');
  const [currentStep, setCurrentStep] = useState("basic-info");
  const [draftId, setDraftId] = useState(draftIdFromUrl || null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const lastSavedDataRef = useRef(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const showAlert = (title, message, type = "error") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);
  const [highlightDraft, setHighlightDraft] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
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
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Camera start failed:", error);
      setCameraError(
        error?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser."
          : "Unable to access camera. Make sure a camera is available and not in use."
      );
      stopCamera();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!isCameraOpen || !video || !stream) return undefined;

    video.srcObject = stream;
    const play = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn("Video play() blocked:", error);
      }
    };

    video.onloadedmetadata = play;

    return () => {
      if (video) {
        video.onloadedmetadata = null;
      }
    };
  }, [isCameraOpen]);

  useEffect(() => () => stopCamera(), []);

  // Load draft if draftId is present in URL
  useEffect(() => {
    if (!draftIdFromUrl) return;
    const loadDraft = async () => {
      try {
        const res = await fetch(`/api/academy/drafts/${draftIdFromUrl}`, { credentials: 'include' });
        if (res.ok) {
          const draft = await res.json();
          if (draft.contentData && Object.keys(draft.contentData).length > 0) {
            setFormData(prev => ({ ...prev, ...draft.contentData }));
            setLastSaved(new Date(draft.lastSavedAt));
          }
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    };
    loadDraft();
  }, [draftIdFromUrl]);

  // Auto-save draft (debounced 5s after changes, with dirty checking)
  const saveDraft = useCallback(async (data) => {
    if (isSavingDraft) return;

    // Dirty check: skip save if content hasn't changed since last save
    const serialized = JSON.stringify(data);
    if (lastSavedDataRef.current === serialized) return;

    setIsSavingDraft(true);
    try {
      if (draftId) {
        const res = await fetch(`/api/academy/drafts/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ contentData: data })
        });
        if (res.ok) {
          setLastSaved(new Date());
          lastSavedDataRef.current = serialized;
        }
      } else {
        const res = await fetch('/api/academy/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ contentType: 'seminar', contentData: data })
        });
        if (res.ok) {
          const newDraft = await res.json();
          setDraftId(newDraft._id);
          setLastSaved(new Date());
          lastSavedDataRef.current = serialized;
        }
      }
    } catch (err) {
      console.error('Auto-save draft error:', err);
    } finally {
      setIsSavingDraft(false);
    }
  }, [draftId, isSavingDraft]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.description) {
        saveDraft(formData);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [formData, saveDraft]);

  const captureSpeakerAvatar = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError("Camera not ready yet. Please try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(async (blob) => {
      try {
        if (!blob) throw new Error("Failed to capture image");

        setIsUploadingAvatar(true);
        setCameraError("");

        const form = new FormData();
        form.append("image", blob, "speaker-avatar.png");

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: form,
          credentials: "include"
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        setFormData((prev) => ({ ...prev, speakerAvatar: data.url }));
        stopCamera();
      } catch (error) {
        console.error("Speaker avatar upload failed:", error);
        setCameraError(error.message || "Failed to upload image");
      } finally {
        setIsUploadingAvatar(false);
      }
    }, "image/png", 0.92);
  };

  const steps = [
    { id: "basic-info", label: "Basic Info" },
    { id: "speaker", label: "Speaker" },
    { id: "schedule", label: "Schedule" }
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const scheduleTimes = getScheduleTimes(formData);
  const calculatedDurationMinutes = scheduleTimes.valid
    ? Math.round(
        (scheduleTimes.endAtLocal.getTime() - scheduleTimes.startAtLocal.getTime()) /
          60000
      )
    : 0;
  const calculatedDurationLabel = formatDurationLabel(calculatedDurationMinutes);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateField(name, value);
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
        showAlert("Validation Error", "Please fill in title and description before continuing.");
      } else if (currentStep === "speaker") {
        showAlert("Validation Error", "Please provide the speaker name before continuing.");
      }
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleStepClick = (targetStepId) => {
    const targetIndex = steps.findIndex(s => s.id === targetStepId);
    if (targetIndex > currentStepIndex) {
      for (let i = currentStepIndex; i < targetIndex; i++) {
        const stepToValidate = steps[i].id;
        if (!isStepValid(stepToValidate)) {
          if (stepToValidate === "basic-info") {
            showAlert("Validation Error", "Please fill in title and description before continuing.");
          } else if (stepToValidate === "speaker") {
            showAlert("Validation Error", "Please provide the speaker name before continuing.");
          }
          return;
        }
      }
    }
    setCurrentStep(targetStepId);
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
      showAlert("Validation Error", "Please provide a valid date/time range. End time must be after start time.");
      return;
    }

    const durationMinutes = String(
      Math.round((endAtLocal.getTime() - startAtLocal.getTime()) / 60000)
    );
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

      showAlert("Success", "Seminar created successfully!", "success");
      if (draftId) {
        try { await fetch(`/api/academy/drafts/${draftId}`, { method: 'DELETE', credentials: 'include' }); } catch (e) { /* ignore */ }
      }
      setTimeout(() => {
        navigate("/academy/seminars");
      }, 1500);
    } catch (error) {
      console.error("Error creating seminar:", error);
      showAlert("Error", error.message || "An unexpected error occurred while creating the seminar.");
    }
  };

  return (
    <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
      <div className="mx-auto max-w-narrow">
        <button
          type="button"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>

        <section className="rounded-[32px] border border-border bg-light-tertiary p-6 shadow-card lg:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Seminars
            </p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-4xl font-bold text-dark sm:text-5xl">
                Create New Seminar
              </h1>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Draft
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-dark-secondary">
              Schedule a live seminar, define the speaker profile, and prepare the
              Zoom access details used by the current branch.
              {isSavingDraft && (
                <span className="ml-2 text-xs text-accent/70">
                  • Saving...
                </span>
              )}
              {lastSaved && !isSavingDraft && (
                <span className="ml-2 text-xs text-dark-secondary/60">
                  • Auto-saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  currentStep === step.id
                    ? "bg-dark text-white shadow-md"
                    : "bg-white text-dark hover:-translate-y-0.5 hover:bg-light-secondary"
                }`}
                onClick={() => handleStepClick(step.id)}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    currentStep === step.id
                      ? "bg-white/15 text-white"
                      : currentStepIndex > index
                      ? "bg-accent text-white"
                      : "bg-light-tertiary text-dark"
                  }`}
                >
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
          {currentStep === "basic-info" ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Step 1
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Seminar information</h2>
                <p className="mt-3 text-sm leading-7 text-dark-secondary">
                  Set the title, description, and attendee expectations.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Seminar Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={inputClasses}
                    placeholder="e.g., Building Your Freelance Brand"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    className={textareaClasses}
                    placeholder="Describe what attendees will learn in this seminar..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>

                <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    What to Expect (up to 3 bullet points)
                  </label>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      type="text"
                      className={`${inputClasses} flex-1`}
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
                      className="inline-flex items-center justify-center rounded-full bg-dark px-4 py-3 text-sm font-semibold text-white transition hover:bg-dark-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={handleAddHighlight}
                      disabled={!highlightDraft.trim() || formData.highlights.length >= 3}
                    >
                      <FiPlus />
                      <span className="ml-2">Add</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {formData.highlights.length === 0 ? (
                      <p className="text-sm text-dark-secondary">
                        No highlights added yet.
                      </p>
                    ) : (
                      formData.highlights.map((highlight, index) => (
                        <div
                          key={`${highlight}-${index}`}
                          className="flex flex-col gap-3 rounded-2xl border border-border bg-white px-4 py-4 md:flex-row md:items-center md:justify-between"
                        >
                          <span className="text-sm text-dark">{highlight}</span>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:bg-light-secondary"
                            onClick={() => handleRemoveHighlight(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <p className="mt-4 text-sm text-dark-secondary">
                    {formData.highlights.length}/3 added
                  </p>
                </div>

                <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                  <ImageUpload
                    value={formData.thumbnail}
                    onChange={(url) => updateField("thumbnail", url)}
                    label="Seminar Thumbnail"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {currentStep === "speaker" ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Step 2
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Speaker profile</h2>
                <p className="mt-3 text-sm leading-7 text-dark-secondary">
                  Add the speaker details and upload or capture an avatar.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Speaker Name *
                  </label>
                  <input
                    type="text"
                    name="speakerName"
                    className={inputClasses}
                    placeholder="e.g., Jane Doe"
                    value={formData.speakerName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Speaker Bio
                  </label>
                  <textarea
                    name="speakerBio"
                    className={textareaClasses}
                    placeholder="Brief biography of the speaker..."
                    value={formData.speakerBio}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>

                <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                  <ImageUpload
                    value={formData.speakerAvatar}
                    onChange={(url) => updateField("speakerAvatar", url)}
                    label="Speaker Avatar"
                  />
                </div>

                <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                  {!isCameraOpen ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-3 text-sm font-semibold text-white transition hover:bg-dark-secondary"
                      onClick={startCamera}
                    >
                      <FiVideo />
                      <span>Use Camera</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="aspect-video w-full rounded-[28px] border border-border bg-black object-cover"
                      />

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={captureSpeakerAvatar}
                          disabled={isUploadingAvatar}
                        >
                          {isUploadingAvatar ? "Capturing..." : "Capture"}
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary"
                          onClick={stopCamera}
                          disabled={isUploadingAvatar}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {cameraError ? (
                    <p className="mt-4 text-sm text-error">{cameraError}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {currentStep === "schedule" ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Step 3
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Schedule & Zoom</h2>
                <p className="mt-3 text-sm leading-7 text-dark-secondary">
                  Set the local date, time range, and Zoom credentials used by the join page.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      className={inputClasses}
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      className={inputClasses}
                      value={formData.startTime}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      className={inputClasses}
                      value={formData.endTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Duration
                  </label>
                  <input
                    type="text"
                    className={inputClasses}
                    value={calculatedDurationLabel}
                    placeholder="Set start and end time"
                    readOnly
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Zoom Meeting ID *
                    </label>
                    <input
                      type="text"
                      name="zoomMeetingId"
                      className={inputClasses}
                      placeholder="e.g., 12345678901"
                      value={formData.zoomMeetingId}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Zoom Passcode *
                    </label>
                    <input
                      type="text"
                      name="zoomPassword"
                      className={inputClasses}
                      placeholder="Enter Zoom passcode"
                      value={formData.zoomPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid("schedule")}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Seminar
            </button>
          )}
        </div>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}

export default CreateSeminar;
