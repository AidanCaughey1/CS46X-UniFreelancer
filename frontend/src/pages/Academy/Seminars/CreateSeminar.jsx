import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateSeminar.css';

function CreateSeminar() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('basic-info');
  const [seminarData, setSeminarData] = useState({
    title: '',
    description: '',
    duration: '',
    type: 'Live Now',
    thumbnail: '',

    speakerName: '',
    speakerBio: '',
    speakerAvatar: '',

    date: '',
    time: '',
    joinUrl: ''
  });

  const handleBack = () => {
    navigate('/academy/create');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSeminarData({
      ...seminarData,
      [name]: value
    });
  };

  const handleCreateSeminar = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/academy/seminars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: seminarData.title,
            description: seminarData.description,
            duration: seminarData.duration,
            type: seminarData.type,
            thumbnail: seminarData.thumbnail,
          
            speaker: {
              name: seminarData.speakerName,
              bio: seminarData.speakerBio,
              avatar: seminarData.speakerAvatar
            },
          
            schedule: {
              date: seminarData.date,
              time: seminarData.time,
              joinUrl: seminarData.joinUrl
            }
          }),
      });

      if (response.ok) {
        alert('Seminar created successfully!');
        navigate('/academy');
      } else {
        alert('Failed to create seminar. Please try again.');
      }
    } catch (error) {
      console.error('Error creating seminar:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/academy/create');
  };

  const steps = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'speaker', label: 'Speaker' },
    { id: 'schedule', label: 'Schedule' },
  ];

  return (
    <div className="create-seminar-page">
      <div className="create-seminar-container">

        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        <h1 className="create-seminar-title">Create New Seminar</h1>
        <p className="create-seminar-subtitle">
          Fill in the details to create a new seminar or webinar
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
          <h2 className="section-title">Seminar Information</h2>
          <p className="section-subtitle">Basic details about your seminar</p>

          <div className="form-group">
            <label className="form-label">Seminar Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g., Building Your Freelance Brand"
              value={seminarData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              rows="5"
              className="form-textarea"
              placeholder="Describe what attendees will learn in this seminar..."
              value={seminarData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                name="duration"
                className="form-input"
                placeholder="e.g., 1.5 hours"
                value={seminarData.duration}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seminar Type</label>
              <select
                name="type"
                className="form-select"
                value={seminarData.type}
                onChange={handleInputChange}
              >
                <option value="Live Now">Live Now</option>
                <option value="Recorded">Recorded</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail URL</label>
            <input
              type="text"
              name="thumbnail"
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={seminarData.thumbnail}
              onChange={handleInputChange}
            />
          </div>
        </div>
        )}

        {currentStep === 'speaker' && (
          <div className="form-section">
            <h2 className="section-title">Speaker Information</h2>
            <p className="section-subtitle">Details about the seminar speaker</p>

          <div className="form-group">
            <label className="form-label">Speaker Name *</label>
            <input
              type="text"
              name="speakerName"
              className="form-input"
              placeholder="e.g., John Smith"
              value={seminarData.speakerName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Speaker Bio</label>
            <textarea
              name="speakerBio"
              rows="4"
              className="form-textarea"
              placeholder="Brief biography of the speaker..."
              value={seminarData.speakerBio}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Speaker Avatar URL</label>
            <input
              type="text"
              name="speakerAvatar"
              className="form-input"
              placeholder="https://example.com/avatar.jpg"
              value={seminarData.speakerAvatar}
              onChange={handleInputChange}
            />
          </div>
        </div>
        )}

        {currentStep === 'schedule' && (
          <div className="form-section">
            <h2 className="section-title">Schedule</h2>
            <p className="section-subtitle">When will this seminar take place?</p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={seminarData.date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                name="time"
                className="form-input"
                value={seminarData.time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Join URL</label>
            <input
              type="text"
              name="joinUrl"
              className="form-input"
              placeholder="https://zoom.us/..."
              value={seminarData.joinUrl}
              onChange={handleInputChange}
            />
          </div>
        </div>
        )}

        {/* Buttons */}
        <div className="form-actions">
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button className="submit-button" onClick={handleCreateSeminar}>
            Create Seminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateSeminar;
