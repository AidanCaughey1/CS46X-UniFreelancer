/* global process */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateTutorial.css";
import { FiArrowLeft } from "react-icons/fi";
import ImageUpload from "../../../components/ImageUpload";

function CreateTutorial() {
  const navigate = useNavigate();
  const { id: tutorialId } = useParams();
  const isEditMode = Boolean(tutorialId);
  const [currentStep, setCurrentStep] = useState('basic-info');
  const [loadingTutorial, setLoadingTutorial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    category: "",
    thumbnail: "",
    videoUrl: "",
    writtenContent: "",
    resources: [],
    instructorName: "",
  });

  useEffect(() => {
    const fetchTutorialForEdit = async () => {
      if (!isEditMode) return;

      try {
        setLoadingTutorial(true);
        const response = await fetch(`/api/academy/tutorials/${tutorialId}`);

        if (!response.ok) {
          throw new Error("Failed to load tutorial");
        }

        const tutorial = await response.json();

        setFormData({
          title: tutorial.title || "",
          description: tutorial.description || "",
          duration: tutorial.duration || "",
          category: tutorial.category || "",
          thumbnail: tutorial.thumbnail || "",
          videoUrl: tutorial.videoUrl || "",
          writtenContent: tutorial.writtenContent || "",
          resources: Array.isArray(tutorial.resources)
            ? tutorial.resources
                .map((resource) => {
                  if (typeof resource === "string") return resource;
                  return resource?.url || "";
                })
                .filter(Boolean)
            : [],
          instructorName: tutorial.instructor?.name || "",
        });
      } catch (error) {
        console.error("Error loading tutorial:", error);
        alert("Failed to load tutorial for editing.");
        navigate("/academy/tutorials");
      } finally {
        setLoadingTutorial(false);
      }
    };

    fetchTutorialForEdit();
  }, [isEditMode, tutorialId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "duration") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      setFormData({
        ...formData,
        [name]: digitsOnly,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, ""],
    });
  };

  const handleResourceChange = (index, value) => {
    const updated = [...formData.resources];
    updated[index] = value;
    setFormData({ ...formData, resources: updated });
  };

  const parseDurationMinutes = (value) => {
    if (!value) return "";
    const normalized = String(value).trim();
    const numberMatch = normalized.match(/^(\d+)$/);
    if (!numberMatch) return null;
    const minutes = Number(numberMatch[1]);
    if (!Number.isFinite(minutes) || minutes <= 0) return null;
    return String(minutes);
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const durationMinutes = parseDurationMinutes(formData.duration);
    if (durationMinutes === null) {
      alert("Duration must be a number of minutes (e.g., 15) or left blank for self-paced.");
      return;
    }

    const trimmedInstructor = formData.instructorName.trim();
    if (!trimmedInstructor) {
      alert("Instructor name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const rest = { ...formData };
      delete rest.instructorName;
      const payload = {
        ...rest,
        duration: durationMinutes
      };

      payload.instructor = { name: trimmedInstructor };
      payload.resources = (formData.resources || [])
        .map((resourceUrl) => String(resourceUrl).trim())
        .filter(Boolean)
        .map((resourceUrl) => ({ url: resourceUrl }));

      console.log("Submitting Tutorial:", payload);

      const response = await fetch(
        isEditMode ? `/api/academy/tutorials/${tutorialId}` : `/api/academy/tutorials`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert(`Tutorial ${isEditMode ? "updated" : "created"} successfully!`);
        navigate(isEditMode ? `/academy/tutorials/${tutorialId}` : "/academy/tutorials");
      } else {
        const errorData = await response.json();
        console.error("Tutorial save failed:", errorData);
        alert(errorData.error || "Failed to save tutorial.");
      }
    } catch (error) {
      console.error("Error saving tutorial:", error);
      alert("An unexpected error occurred while saving the tutorial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTutorial = async () => {
    if (!isEditMode) return;

    const confirmed = window.confirm("Are you sure you want to delete this tutorial? This cannot be undone.");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/academy/tutorials/${tutorialId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert("Tutorial was already deleted.");
          navigate("/academy/tutorials");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete tutorial");
      }

      alert("Tutorial deleted successfully.");
      navigate("/academy/tutorials");
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      alert(error.message || "Failed to delete tutorial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'resources', label: 'Resources' }
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const isStepValid = (stepId) => {
    if (stepId === "basic-info") {
      return (
        formData.title.trim() !== "" &&
        formData.description.trim() !== "" &&
        formData.category.trim() !== ""
      );
    }

    if (stepId === "content") {
      return (
        formData.videoUrl.trim() !== "" ||
        formData.writtenContent.trim() !== ""
      );
    }

    return true;
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      if (currentStep === "basic-info") {
        alert("Please fill in all required fields before continuing.");
      } else if (currentStep === "content") {
        alert("Please add a video URL or written content before continuing.");
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

  return (
    <div className="create-tutorial-page">
      <div className="create-tutorial-container">
        {loadingTutorial ? (
          <div className="loading-message">Loading tutorial...</div>
        ) : (
          <>
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>

        <h1>{isEditMode ? "Edit Tutorial" : "Create New Tutorial"}</h1>
        <p className="page-subtitle">
          {isEditMode ? "Update your tutorial details" : "Fill in the details to create a new tutorial"}
        </p>

        {isEditMode && (
          <div className="form-actions" style={{ justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={handleDeleteTutorial}
              className="secondary-button"
              disabled={isSubmitting}
            >
              Delete Tutorial
            </button>
          </div>
        )}

        <div className="steps-indicator">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step ${currentStepIndex === index ? "active" : ""} ${
                currentStepIndex > index ? "completed" : ""
              }`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        <div className="form-container">
          {currentStep === "basic-info" && (
            <div className="form-section">
              <h2>Tutorial Information</h2>
              <p className="section-subtitle">Basic details about your tutorial</p>

              <div className="form-group">
                <label>Tutorial Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., How to Create a Portfolio Website"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe what students will learn..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (in Minutes)</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="Minutes only (e.g., 15)"
                  value={formData.duration}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyDown={(event) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                      "Home",
                      "End"
                    ];

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

                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g., Web Development"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Instructor *</label>
                <input
                  type="text"
                  name="instructorName"
                  placeholder="e.g., Jane Doe"
                  value={formData.instructorName}
                  onChange={handleChange}
                  required
                />
              </div>

              <ImageUpload
                value={formData.thumbnail}
                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                label="Tutorial Thumbnail"
              />
            </div>
          )}

          {currentStep === "content" && (
            <div className="form-section">
              <h2>Tutorial Content</h2>
              <p className="section-subtitle">Video and written content</p>

              <div className="form-group">
                <label>Video URL</label>
                <input
                  type="text"
                  name="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Written Content</label>
                <textarea
                  name="writtenContent"
                  placeholder="Step-by-step instructions..."
                  value={formData.writtenContent}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === "resources" && (
            <div className="form-section">
              <h2>Downloadable Resources</h2>
              <p className="section-subtitle">Optional supporting materials</p>

              <div className="resource-list">
                {formData.resources.length === 0 && (
                  <p className="empty-state">No downloadable resources added yet.</p>
                )}

                {formData.resources.map((res, index) => (
                  <input
                    key={index}
                    className="resource-input"
                    placeholder="Resource URL..."
                    value={res}
                    onChange={(e) => handleResourceChange(index, e.target.value)}
                  />
                ))}
              </div>

              <button type="button" className="add-button" onClick={addResource}>
                + Add Downloadable Resource
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="secondary-button"
          >
            Previous
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="primary-button"
              disabled={!isStepValid(currentStep)}
            >
              Next
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                className="primary-button"
                disabled={isSubmitting}
              >
                {isEditMode ? "Update Tutorial" : "Create Tutorial"}
              </button>
            </>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateTutorial;
