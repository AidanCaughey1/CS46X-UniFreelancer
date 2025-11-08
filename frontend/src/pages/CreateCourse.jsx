import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCourse.css';

function CreateCourse() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('basic-info');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    category: '',
    thumbnail: '',
    isLiteVersion: false,
  });

  const handleBack = () => {
    navigate('/academy/create');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData({
      ...courseData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/academy/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          duration: courseData.duration,
          difficulty: courseData.difficulty,
          category: courseData.category,
          thumbnail: courseData.thumbnail,
          isLiteVersion: courseData.isLiteVersion,
        }),
      });

      if (response.ok) {
        alert('Course created successfully!');
        navigate('/academy');
      } else {
        alert('Failed to create course. Please try again.');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/academy/create');
  };

  const steps = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'content', label: 'Content' },
    { id: 'modules', label: 'Modules' },
  ];

  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        <h1 className="create-course-title">Create New Course</h1>
        <p className="create-course-subtitle">Fill in the details to create a new course</p>

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
            <h2 className="section-title">Course Information</h2>
            <p className="section-subtitle">Basic details about your course</p>

            <div className="form-group">
              <label className="form-label">
                Course Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g., Complete Digital Marketing Masterclass"
                value={courseData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                className="form-textarea"
                rows="5"
                placeholder="Describe what students will learn in this course..."
                value={courseData.description}
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
                  placeholder="e.g., 12 weeks"
                  value={courseData.duration}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  name="difficulty"
                  className="form-select"
                  value={courseData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Badge/Category</label>
              <input
                type="text"
                name="category"
                className="form-input"
                placeholder="e.g., Digital Marketing"
                value={courseData.category}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Thumbnail URL</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  name="thumbnail"
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={courseData.thumbnail}
                  onChange={handleInputChange}
                />
                <span className="upload-icon">⬆</span>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isLiteVersion"
                  checked={courseData.isLiteVersion}
                  onChange={handleInputChange}
                />
                <span>This is a Lite version (free tier with limited content)</span>
              </label>
            </div>
          </div>
        )}

        {currentStep === 'instructor' && (
          <div className="form-section">
            <h2 className="section-title">Instructor Information</h2>
            <p className="section-subtitle">Details about the course instructor</p>
            <p className="coming-soon">This section is coming soon...</p>
          </div>
        )}

        {currentStep === 'pricing' && (
          <div className="form-section">
            <h2 className="section-title">Pricing Details</h2>
            <p className="section-subtitle">Set the price for your course</p>
            <p className="coming-soon">This section is coming soon...</p>
          </div>
        )}

        {currentStep === 'content' && (
          <div className="form-section">
            <h2 className="section-title">Course Content</h2>
            <p className="section-subtitle">Add learning points and materials</p>
            <p className="coming-soon">This section is coming soon...</p>
          </div>
        )}

        {currentStep === 'modules' && (
          <div className="form-section">
            <h2 className="section-title">Course Modules</h2>
            <p className="section-subtitle">Organize your course into modules and lessons</p>
            <p className="coming-soon">This section is coming soon...</p>
          </div>
        )}

        <div className="form-actions">
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button className="submit-button" onClick={handleCreateCourse}>
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;




