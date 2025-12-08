import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTutorial.css";
import { FiArrowLeft, FiUpload } from "react-icons/fi";

function CreateTutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('basic-info');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    category: "",
    thumbnailUrl: "",
    videoUrl: "",
    writtenContent: "",
    resources: [],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

  // 🔥 FIXED — Now actually submits to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting Tutorial:", formData);

      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/academy/tutorials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Tutorial created successfully!");
        navigate("/academy/tutorials");
      } else {
        const errorData = await response.json();
        console.error("Tutorial creation failed:", errorData);
        alert("Failed to create tutorial. Check console for details.");
      }
    } catch (error) {
      console.error("Error creating tutorial:", error);
      alert("An unexpected error occurred while creating the tutorial.");
    }
  };

  const steps = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <div className="create-tutorial-page">
      <div className="create-tutorial-container">

        {/* Back Button */}
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>

        <h1 className="create-tutorial-title">Create New Tutorial</h1>
        <p className="create-tutorial-subtitle">
          Fill in the details to create a new tutorial
        </p>

        <div className="step-navigation">
          {steps.map((step) => (
            <button
              key={step.id}
              className={`step-button ${currentStep === step.id ? 'active' : ''}`}
              onClick={() => setCurrentStep(step.id)}
            >
              {step.label}
            </button>
          ))}
        </div>

        {currentStep === 'basic-info' && (
          <div className="form-section">
          <h2 className="section-title">Tutorial Information</h2>
          <p className="section-subtitle">Basic details about your tutorial</p>

          <div className="form-group">
            <label className="form-label">
              Tutorial Title <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g., How to Create a Portfolio Website"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe what students will learn..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                name="duration"
                className="form-input"
                placeholder="e.g., 15 min"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                name="category"
                className="form-input"
                placeholder="e.g., Web Development"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="form-group input-with-icon">
            <label className="form-label">Thumbnail URL</label>
            <input
              type="text"
              name="thumbnailUrl"
              className="form-input"
              placeholder="https://example.com/thumbnail.jpg"
              value={formData.thumbnailUrl}
              onChange={handleChange}
            />
            <FiUpload className="upload-icon" />
          </div>
        </div>
        )}

        {currentStep === 'content' && (
          <div className="form-section">
            <h2 className="section-title">Tutorial Content</h2>
            <p className="section-subtitle">Video and written content</p>

          <div className="form-group">
            <label className="form-label">Video URL</label>
            <input
              type="text"
              name="videoUrl"
              className="form-input"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Written Content</label>
            <textarea
              name="writtenContent"
              className="form-textarea"
              placeholder="Step-by-step instructions..."
              value={formData.writtenContent}
              onChange={handleChange}
            />
          </div>
        </div>
        )}

        {currentStep === 'resources' && (
          <div className="form-section">
            <h2 className="section-title">Downloadable Resources</h2>
            <p className="section-subtitle">Optional supporting materials</p>

          <div className="resource-list">
            {formData.resources.length === 0 && (
              <p className="coming-soon">No downloadable resources added yet.</p>
            )}

            {formData.resources.map((res, index) => (
              <input
                key={index}
                className="form-input"
                placeholder="Resource URL..."
                value={res}
                onChange={(e) =>
                  handleResourceChange(index, e.target.value)
                }
                style={{ marginBottom: "15px" }}
              />
            ))}
          </div>

          <button className="add-resource-btn" onClick={addResource}>
            + Add Downloadable Resource
          </button>
        </div>
        )}

        {/* ===================== ACTION BUTTONS ===================== */}
        <div className="form-actions">
          <button className="cancel-button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="submit-button" onClick={handleSubmit}>
            Create Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTutorial;
