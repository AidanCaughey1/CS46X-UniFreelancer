import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import ImageUpload from "../../../components/ImageUpload";

const inputClasses =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark";
const textareaClasses =
  "w-full min-h-[180px] rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark";

function CreateTutorial() {
  const navigate = useNavigate();
  const { id: tutorialId } = useParams();
  const isEditMode = Boolean(tutorialId);
  const [currentStep, setCurrentStep] = useState("basic-info");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);
  
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
    instructorName: ""
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
          instructorName: tutorial.instructor?.name || ""
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
  }, [isEditMode, navigate, tutorialId]);

  const steps = [
    { id: "basic-info", label: "Basic Info" },
    { id: "content", label: "Content" },
    { id: "resources", label: "Resources" }
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "duration") {
      updateField(name, value.replace(/[^0-9]/g, ""));
      return;
    }

    updateField(name, value);
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, ""]
    }));
  };

  const handleResourceChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((resource, resourceIndex) =>
        resourceIndex === index ? value : resource
      )
    }));
  };

  const removeResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, resourceIndex) => resourceIndex !== index)
    }));
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

  const isStepValid = (stepId) => {
    if (stepId === "basic-info") {
      return (
        formData.title.trim() !== "" &&
        formData.description.trim() !== "" &&
        formData.category.trim() !== "" &&
        formData.instructorName.trim() !== ""
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

  const handleStepClick = (targetStepId) => {
    const targetIndex = steps.findIndex(s => s.id === targetStepId);
    if (targetIndex > currentStepIndex) {
      for (let i = currentStepIndex; i < targetIndex; i++) {
        const stepToValidate = steps[i].id;
        if (!isStepValid(stepToValidate)) {
          if (stepToValidate === "basic-info") {
            alert("Please fill in all required fields before continuing.");
          } else if (stepToValidate === "content") {
            alert("Please add a video URL or written content before continuing.");
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

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: durationMinutes,
        category: formData.category.trim(),
        thumbnail: formData.thumbnail,
        videoUrl: formData.videoUrl.trim(),
        writtenContent: formData.writtenContent.trim(),
        instructor: { name: trimmedInstructor },
        resources: (formData.resources || [])
          .map((resourceUrl) => String(resourceUrl).trim())
          .filter(Boolean)
          .map((resourceUrl) => ({ url: resourceUrl }))
      };

      const response = await fetch(
        isEditMode ? `/api/academy/tutorials/${tutorialId}` : `/api/academy/tutorials`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save tutorial.");
      }

      alert(`Tutorial ${isEditMode ? "updated" : "created"} successfully!`);
      navigate(isEditMode ? `/academy/tutorials/${tutorialId}` : "/academy/tutorials");
    } catch (error) {
      console.error("Error saving tutorial:", error);
      alert(error.message || "An unexpected error occurred while saving the tutorial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTutorial = async () => {
    if (!isEditMode) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this tutorial? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/academy/tutorials/${tutorialId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert("Tutorial was already deleted.");
          navigate("/academy/tutorials");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete tutorial.");
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

  if (loadingTutorial) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-narrow rounded-[32px] border border-border bg-white px-6 py-16 text-center text-dark-secondary shadow-card">
          Loading tutorial...
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Tutorials
              </p>
              <h1 className="mt-2 text-4xl font-bold text-dark sm:text-5xl">
                {isEditMode ? "Edit Tutorial" : "Create New Tutorial"}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-dark-secondary">
                {isEditMode
                  ? "Update the tutorial details, resources, and learning content."
                  : "Set up a focused tutorial with video, written notes, and downloadable resources."}
              </p>
            </div>

            {isEditMode ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-error/20 bg-white px-4 py-2 text-sm font-semibold text-error transition hover:bg-[#fff2f2]"
                onClick={handleDeleteTutorial}
                disabled={isSubmitting}
              >
                <FiTrash2 />
                <span>Delete Tutorial</span>
              </button>
            ) : null}
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
                <h2 className="mt-2 text-3xl font-bold text-dark">Tutorial information</h2>
                <p className="mt-3 text-sm leading-7 text-dark-secondary">
                  Basic details for the tutorial card and detail page.
                </p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Tutorial Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={inputClasses}
                    placeholder="e.g., How to Create a Portfolio Website"
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
                    placeholder="Describe what students will learn..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Duration (minutes)
                    </label>
                    <input
                      type="text"
                      name="duration"
                      className={inputClasses}
                      placeholder="Minutes only (e.g., 15)"
                      value={formData.duration}
                      onChange={handleChange}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      className={inputClasses}
                      placeholder="e.g., Web Development"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Instructor *
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    className={inputClasses}
                    placeholder="e.g., Jane Doe"
                    value={formData.instructorName}
                    onChange={handleChange}
                  />
                </div>

                <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                  <ImageUpload
                    value={formData.thumbnail}
                    onChange={(url) => updateField("thumbnail", url)}
                    label="Tutorial Thumbnail"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {currentStep === "content" ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Step 2
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Content</h2>
                <p className="mt-3 text-sm leading-7 text-dark-secondary">
                  Provide a video URL, written notes, or both.
                </p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Video URL
                  </label>
                  <input
                    type="text"
                    name="videoUrl"
                    className={inputClasses}
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Written Content
                  </label>
                  <textarea
                    name="writtenContent"
                    className={textareaClasses}
                    placeholder="Step-by-step instructions..."
                    value={formData.writtenContent}
                    onChange={handleChange}
                    rows={10}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {currentStep === "resources" ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Step 3
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Resources</h2>
                <p className="mt-3 text-sm leading-7 text-dark-secondary">
                  Add any supporting files or links learners should download later.
                </p>
              </div>

              <div className="space-y-4">
                {formData.resources.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-border bg-light-tertiary px-5 py-10 text-center text-sm text-dark-secondary">
                    No downloadable resources added yet.
                  </div>
                ) : (
                  formData.resources.map((resource, index) => (
                    <div
                      key={`resource-${index}`}
                      className="flex flex-col gap-3 rounded-[28px] border border-border bg-light-tertiary p-4 md:flex-row md:items-center"
                    >
                      <input
                        className={`${inputClasses} flex-1`}
                        placeholder="Resource URL..."
                        value={resource}
                        onChange={(event) =>
                          handleResourceChange(index, event.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary"
                        onClick={() => removeResource(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-3 text-sm font-semibold text-white transition hover:bg-dark-secondary"
                  onClick={addResource}
                >
                  <FiPlus />
                  <span>Add Downloadable Resource</span>
                </button>
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
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Tutorial"
                : "Create Tutorial"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateTutorial;
