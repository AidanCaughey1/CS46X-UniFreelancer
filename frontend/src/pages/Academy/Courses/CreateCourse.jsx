import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCourse.css';

function CreateCourse() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('basic-info');
  const [learningPoint, setLearningPoint] = useState('');
  const [modulePoint, setModulePoint] = useState('');
  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    videoUrl: '',
    articleContent: '',
    pdfUrl: '',
    learningPoints: [],
    duration: '',
    thumbnail: '',
  });

  const [courseData, setCourseData] = useState({
    // basic info
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    category: '',
    thumbnail: '',
    isLiteVersion: false,

    // instructor
    instructorName: '',
    instructorTitle: '',
    instructorBio: '',
    instructorAvatar: '',

    // pricing
    priceAmount: '',
    priceCurrency: 'USD',
    pricingType: 'one-time',

    // subscription info
    isSubscriptionCourse: false,
    subscriptionTier: '',

    // content
    learningPoints: [],

    // modules
    modules: [],
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

  const handleAddLearningPoint = () => {
    if (learningPoint.trim()) {
      setCourseData({
        ...courseData,
        learningPoints: [...courseData.learningPoints, learningPoint.trim()],
      });
      setLearningPoint('');
    }
  };

  const handleRemoveLearningPoint = (index) => {
    setCourseData({
      ...courseData,
      learningPoints: courseData.learningPoints.filter((_, i) => i !== index),
    });
  };

  const handleModuleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentModule({
      ...currentModule,
      [name]: value,
    });
  };

  const handleAddModulePoint = () => {
    if (modulePoint.trim()) {
      setCurrentModule({
        ...currentModule,
        learningPoints: [...currentModule.learningPoints, modulePoint.trim()],
      });
      setModulePoint('');
    }
  };

  const handleRemoveModulePoint = (index) => {
    setCurrentModule({
      ...currentModule,
      learningPoints: currentModule.learningPoints.filter((_, i) => i !== index),
    });
  };

  const handleAddModule = () => {
    if (!currentModule.title.trim()) {
      alert('Please enter a module title');
      return;
    }

    setCourseData({
      ...courseData,
      modules: [...courseData.modules, { ...currentModule, order: courseData.modules.length }],
    });

    // Reset current module
    setCurrentModule({
      title: '',
      description: '',
      videoUrl: '',
      articleContent: '',
      pdfUrl: '',
      learningPoints: [],
      duration: '',
      thumbnail: '',
    });
    setModulePoint('');
  };

  const handleRemoveModule = (index) => {
    setCourseData({
      ...courseData,
      modules: courseData.modules.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    if (!courseData.title.trim()) {
      alert('Please enter a course title');
      setCurrentStep('basic-info');
      return false;
    }
    if (!courseData.description.trim()) {
      alert('Please enter a course description');
      setCurrentStep('basic-info');
      return false;
    }
    if (!courseData.instructorName.trim()) {
      alert('Please enter an instructor name');
      setCurrentStep('instructor');
      return false;
    }
    return true;
  };

  const handleCreateCourse = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/academy/courses`, {
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

          instructor: {
            name: courseData.instructorName,
            title: courseData.instructorTitle,
            bio: courseData.instructorBio,
            avatar: courseData.instructorAvatar,
          },

          pricing: {
            amount: courseData.priceAmount ? Number(courseData.priceAmount) : 0,
            currency: courseData.priceCurrency,
            type: courseData.pricingType,
          },

          subscription: {
            isSubscriptionCourse: courseData.isSubscriptionCourse,
            tier: courseData.subscriptionTier,
          },

          learningPoints: courseData.learningPoints,
          modules: courseData.modules,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Course created successfully!');
        navigate('/academy/courses');
      } else {
        alert(`Failed to create course: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('An error occurred while creating the course. Please try again.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/academy/create');
    }
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
                required
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
                required
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
              <label className="form-label">Category</label>
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

            <div className="form-group">
              <label className="form-label">
                Instructor Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="instructorName"
                className="form-input"
                placeholder="e.g., Alina Padilla-Miller"
                value={courseData.instructorName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructor Title/Role</label>
              <input
                type="text"
                name="instructorTitle"
                className="form-input"
                placeholder="e.g., Senior Freelance Designer"
                value={courseData.instructorTitle}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructor Bio</label>
              <textarea
                name="instructorBio"
                className="form-textarea"
                rows="4"
                placeholder="Short overview of the instructor's background..."
                value={courseData.instructorBio}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructor Avatar URL</label>
              <input
                type="text"
                name="instructorAvatar"
                className="form-input"
                placeholder="https://example.com/avatar.png"
                value={courseData.instructorAvatar}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        {currentStep === 'pricing' && (
          <div className="form-section">
            <h2 className="section-title">Pricing Details</h2>
            <p className="section-subtitle">Set the price for your course. Leave blank for free courses</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="priceAmount"
                  className="form-input"
                  placeholder="e.g., 199"
                  value={courseData.priceAmount}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  name="priceCurrency"
                  className="form-select"
                  value={courseData.priceCurrency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pricing Type</label>
              <select
                name="pricingType"
                className="form-select"
                value={courseData.pricingType}
                onChange={handleInputChange}
              >
                <option value="one-time">One-time payment</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>

            {courseData.pricingType === 'subscription' && (
              <p className="section-subtitle" style={{ marginTop: '10px' }}>
                (You can extend this to monthly / yearly plans later.)
              </p>
            )}

            {courseData.isLiteVersion && (
              <p className="section-subtitle" style={{ marginTop: '10px' }}>
                Note: this course is marked as "Lite", so it may be treated as
                free in the course list.
              </p>
            )}
          </div>
        )}

        {currentStep === 'content' && (
          <div className="form-section">
            <h2 className="section-title">Course Content</h2>
            <p className="section-subtitle">Add key learning points for your course</p>

            <div className="form-group">
              <label className="form-label">Learning Points</label>
              <div className="learning-point-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Master social media marketing strategies"
                  value={learningPoint}
                  onChange={(e) => setLearningPoint(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLearningPoint();
                    }
                  }}
                />
                <button
                  type="button"
                  className="add-point-button"
                  onClick={handleAddLearningPoint}
                >
                  Add Point
                </button>
              </div>
            </div>

            {courseData.learningPoints.length > 0 && (
              <div className="learning-points-list">
                <h3 className="list-title">Added Learning Points:</h3>
                <ul className="points-list">
                  {courseData.learningPoints.map((point, index) => (
                    <li key={index} className="point-item">
                      <span className="point-text">✓ {point}</span>
                      <button
                        type="button"
                        className="remove-point-button"
                        onClick={() => handleRemoveLearningPoint(index)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {courseData.learningPoints.length === 0 && (
              <p className="empty-state">No learning points added yet. Add some to help students understand what they'll learn!</p>
            )}
          </div>
        )}

        {currentStep === 'modules' && (
          <div className="form-section">
            <h2 className="section-title">Course Modules</h2>
            <p className="section-subtitle">Organize your course into structured modules with content</p>

            <div className="module-form">
              <h3 className="subsection-title">Add New Module</h3>

              <div className="form-group">
                <label className="form-label">
                  Module Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g., Introduction to Digital Marketing"
                  value={currentModule.title}
                  onChange={handleModuleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Module Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="3"
                  placeholder="Brief description of what this module covers..."
                  value={currentModule.description}
                  onChange={handleModuleInputChange}
                />
              </div>

              <div className="content-type-section">
                <h4 className="content-label">Module Content</h4>

                <div className="form-group">
                  <label className="form-label">Video URL</label>
                  <input
                    type="text"
                    name="videoUrl"
                    className="form-input"
                    placeholder="https://youtube.com/watch?v=..."
                    value={currentModule.videoUrl}
                    onChange={handleModuleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Article Content</label>
                  <textarea
                    name="articleContent"
                    className="form-textarea"
                    rows="5"
                    placeholder="Write your article content here..."
                    value={currentModule.articleContent}
                    onChange={handleModuleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PDF/Document URL</label>
                  <input
                    type="text"
                    name="pdfUrl"
                    className="form-input"
                    placeholder="https://example.com/document.pdf"
                    value={currentModule.pdfUrl}
                    onChange={handleModuleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    className="form-input"
                    placeholder="e.g., 45 minutes"
                    value={currentModule.duration}
                    onChange={handleModuleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thumbnail URL</label>
                  <input
                    type="text"
                    name="thumbnail"
                    className="form-input"
                    placeholder="https://example.com/thumb.jpg"
                    value={currentModule.thumbnail}
                    onChange={handleModuleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Module Learning Points</label>
                <div className="learning-point-input">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Understand key marketing concepts"
                    value={modulePoint}
                    onChange={(e) => setModulePoint(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddModulePoint();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-point-button"
                    onClick={handleAddModulePoint}
                  >
                    Add Point
                  </button>
                </div>
              </div>

              {currentModule.learningPoints.length > 0 && (
                <div className="module-points-list">
                  <ul className="points-list">
                    {currentModule.learningPoints.map((point, index) => (
                      <li key={index} className="point-item">
                        <span className="point-text">✓ {point}</span>
                        <button
                          type="button"
                          className="remove-point-button"
                          onClick={() => handleRemoveModulePoint(index)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                className="add-module-button"
                onClick={handleAddModule}
              >
                + Add Module to Course
              </button>
            </div>

            {courseData.modules.length > 0 && (
              <div className="modules-list">
                <h3 className="list-title">Course Modules ({courseData.modules.length})</h3>
                {courseData.modules.map((module, index) => (
                  <div key={index} className="module-card">
                    <div className="module-header">
                      <div className="module-info">
                        <span className="module-number">Module {index + 1}</span>
                        <h4 className="module-title">{module.title}</h4>
                        {module.duration && <span className="module-duration">⏱ {module.duration}</span>}
                      </div>
                      <button
                        type="button"
                        className="remove-module-button"
                        onClick={() => handleRemoveModule(index)}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    {module.description && (
                      <p className="module-description">{module.description}</p>
                    )}
                    <div className="module-content-tags">
                      {module.videoUrl && <span className="content-tag">📹 Video</span>}
                      {module.articleContent && <span className="content-tag">📝 Article</span>}
                      {module.pdfUrl && <span className="content-tag">📄 PDF</span>}
                    </div>
                    {module.learningPoints.length > 0 && (
                      <div className="module-learning-points">
                        <strong>Learning Points:</strong>
                        <ul>
                          {module.learningPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {courseData.modules.length === 0 && (
              <p className="empty-state">No modules added yet. Create your first module above!</p>
            )}
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
