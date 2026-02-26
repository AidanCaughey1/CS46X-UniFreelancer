import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './CreateCourse.css';
import ImageUpload from '../../../components/ImageUpload';
import ModuleBuilder from './ModuleBuilder';

function CreateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams(); 
  const [isEditMode, setIsEditMode] = useState(false); 
  const [currentStep, setCurrentStep] = useState(1);

  const [courseData, setCourseData] = useState({
    // Basic Info
    title: '',
    overview: '',
    duration: '',
    difficulty: 'Beginner',
    category: '',
    thumbnail: '',
    isLiteVersion: false,

    // Instructor
    instructor: {
      name: '',
      title: '',
      bio: '',
      avatar: ''
    },

    // Pricing
    pricing: {
      amount: 0,
      currency: 'USD',
      type: 'one-time'
    },

    // Modules (new structure)
    modules: [],

    // Final Test
    finalTest: {
      title: 'Final Test',
      description: '',
      passingScore: 70,
      timeLimit: 0,
      questions: []
    },

    // Badge
    badge: {
      name: '',
      description: '',
      color: '#4F46E5',
      imageUrl: ''
    }
  });

  const [currentModule, setCurrentModule] = useState({
    title: '',
    overview: '',
    learningOutcomes: [],
    learningMaterials: {
      readings: [],
      podcasts: [],
      videos: []
    },
    assignment: null
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });

  const steps = ['Basic Info', 'Instructor', 'Pricing', 'Modules', 'Final Test', 'Badge'];

  // Fetch course data if editing
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/academy/courses/${courseId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const course = await response.json();
      
      // Pre-populate the form with existing data
      setCourseData({
        title: course.title || '',
        overview: course.description || '',
        duration: course.duration || '',
        difficulty: course.difficulty || 'Beginner',
        category: course.category || '',
        thumbnail: course.thumbnail || '',
        isLiteVersion: course.isLiteVersion || false,
        
        instructor: {
          name: course.instructor?.name || '',
          title: course.instructor?.title || '',
          bio: course.instructor?.bio || '',
          avatar: course.instructor?.avatar || ''
        },
        
        pricing: {
          amount: course.pricing?.amount || 0,
          currency: course.pricing?.currency || 'USD',
          type: course.pricing?.type || 'one-time'
        },
        
        modules: course.modules || [],
        
        finalTest: course.finalTest || {
          title: 'Final Test',
          description: '',
          passingScore: 70,
          timeLimit: 0,
          questions: []
        },
        
        badge: course.badge || {
          name: '',
          description: '',
          color: '#4F46E5',
          imageUrl: ''
        }
      });
      
      setIsEditMode(true);
      
    } catch (err) {
      console.error('Error fetching course:', err);
      alert('Failed to load course for editing');
      navigate('/instructor/dashboard');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setCourseData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setCourseData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addLearningOutcome = () => {
    if (newOutcome.trim()) {
      setCurrentModule(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, newOutcome]
      }));
      setNewOutcome('');
    }
  };

  const removeLearningOutcome = (index) => {
    setCurrentModule(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const handleModuleSave = (module) => {
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, { ...module, order: prev.modules.length }]
    }));
    
    // Reset current module
    setCurrentModule({
      title: '',
      overview: '',
      learningOutcomes: [],
      learningMaterials: {
        readings: [],
        podcasts: [],
        videos: []
      },
      assignment: null
    });
  };

  const removeModule = (index) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addQuestionToTest = () => {
    if (!currentQuestion.question) {
      alert('Please enter a question');
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill in all answer options');
      return;
    }
    if (currentQuestion.correctAnswer === '') {
      alert('Please specify the correct answer');
      return;
    }

    setCourseData(prev => ({
      ...prev,
      finalTest: {
        ...prev.finalTest,
        questions: [...prev.finalTest.questions, {
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: parseInt(currentQuestion.correctAnswer),
          points: currentQuestion.points
        }]
      }
    }));

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });
  };

  const removeQuestionFromTest = (index) => {
    setCourseData(prev => ({
      ...prev,
      finalTest: {
        ...prev.finalTest,
        questions: prev.finalTest.questions.filter((_, i) => i !== index)
      }
    }));
  };

const handleSubmit = async () => {
  try {
    if (!courseData.title || !courseData.overview) {
      alert('Please fill in course title and overview');
      return;
    }
    if (!courseData.instructor.name) {
      alert('Please fill in instructor information');
      return;
    }
    if (courseData.modules.length === 0) {
      alert('Please add at least one module');
      return;
    }

    // Transform data to match backend schema
    const backendData = {
      title: courseData.title,
      description: courseData.overview,
      duration: courseData.duration,
      difficulty: courseData.difficulty,
      category: courseData.category,
      thumbnail: courseData.thumbnail,
      isLiteVersion: courseData.isLiteVersion,
      
      instructor: courseData.instructor,
      pricing: courseData.pricing,
      
      // Include ALL the new fields
      modules: courseData.modules.map(module => ({
        title: module.title,
        description: module.overview || module.description,
        order: module.order,
        learningOutcomes: module.learningOutcomes,
        learningMaterials: module.learningMaterials,
        assignment: module.assignment,
        lessons: module.lessons || []
      })),
      
      finalTest: courseData.finalTest.questions.length > 0 ? courseData.finalTest : null,
      badge: courseData.badge
    };

    console.log('Sending course data:', JSON.stringify(backendData, null, 2));

    // Determine if creating or updating
    const url = isEditMode ? `/api/academy/courses/${courseId}` : '/api/academy/courses';
    const method = isEditMode ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(backendData)
    });

    const responseData = await res.json();
    
    if (!res.ok) {
      console.error('Server error response:', responseData);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} course: ${responseData.error || 'Unknown error'}`);
      return;
    }

    alert(`Course ${isEditMode ? 'updated' : 'created'} successfully!`);
    navigate('/instructor/dashboard');

  } catch (err) {
    console.error('Error saving course:', err);
    alert(`Failed to ${isEditMode ? 'update' : 'create'} course: ${err.message}`);
  }
};

  // Camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'

  const startCamera = async () => {
    setCameraError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      setCameraStream(stream);
      setCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied.'
          : err?.name === 'NotFoundError'
          ? 'No camera device found.'
          : 'Could not access the camera.';
      setCameraError(msg);
      setCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    setCameraStream(null);
    setCameraOpen(false);
  };

  const captureInstructorAvatar = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    // data URL works with <img src="..."> and your existing "avatar" string field
    const dataUrl = canvas.toDataURL('image/png');

    handleInputChange('instructor', 'avatar', dataUrl);

    stopCamera();
  };

  // If camera is open and we switch cameras, restart stream
useEffect(() => {
  if (!cameraOpen) return;
  if (!cameraStream) return;
  if (!videoRef.current) return;

  const video = videoRef.current;
  video.srcObject = cameraStream;

  const playVideo = async () => {
    try {
      await video.play();
    } catch (err) {
      console.warn('Video play error:', err);
    }
  };

  video.onloadedmetadata = playVideo;
  playVideo();

}, [cameraOpen, cameraStream]);


  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h2>Course Information</h2>
            <p className="section-subtitle">Basic details about your course</p>

            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => handleInputChange(null, 'title', e.target.value)}
                placeholder="e.g., Branding Yourself in Freelancing"
              />
            </div>

            <div className="form-group">
              <label>Course Overview *</label>
              <textarea
                value={courseData.overview}
                onChange={(e) => handleInputChange(null, 'overview', e.target.value)}
                placeholder="In today's competitive freelance market, your brand is your most powerful asset..."
                rows={6}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={courseData.duration}
                  onChange={(e) => handleInputChange(null, 'duration', e.target.value)}
                  placeholder="e.g., 4 weeks"
                />
              </div>

              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  value={courseData.difficulty}
                  onChange={(e) => handleInputChange(null, 'difficulty', e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={courseData.category}
                onChange={(e) => handleInputChange(null, 'category', e.target.value)}
                placeholder="e.g., Digital Marketing, Design, Development"
              />
            </div>

            <ImageUpload
              value={courseData.thumbnail}
              onChange={(url) => handleInputChange(null, 'thumbnail', url)}
              label="Course Thumbnail"
            />
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={courseData.isLiteVersion}
                  onChange={(e) => handleInputChange(null, 'isLiteVersion', e.target.checked)}
                />
                This is a Lite version (free tier with limited content)
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <h2>Instructor Information</h2>
            <p className="section-subtitle">Details about the course instructor</p>

            <div className="form-group">
              <label>Instructor Name *</label>
              <input
                type="text"
                value={courseData.instructor.name}
                onChange={(e) => handleInputChange('instructor', 'name', e.target.value)}
                placeholder="e.g., Dr. Sarah Johnson"
              />
            </div>

            <div className="form-group">
              <label>Instructor Title/Role</label>
              <input
                type="text"
                value={courseData.instructor.title}
                onChange={(e) => handleInputChange('instructor', 'title', e.target.value)}
                placeholder="e.g., Senior Marketing Consultant"
              />
            </div>

            <div className="form-group">
              <label>Instructor Bio</label>
              <textarea
                value={courseData.instructor.bio}
                onChange={(e) => handleInputChange('instructor', 'bio', e.target.value)}
                placeholder="Brief overview of the instructor's background and expertise..."
                rows={4}
              />
            </div>

            <ImageUpload
              value={courseData.instructor.avatar}
              onChange={(url) => handleInputChange('instructor', 'avatar', url)}
              label="Instructor Avatar"
            />
            <div className="form-group">
              <label>Or take a photo</label>

              {courseData.instructor.avatar && (
                <div style={{ marginBottom: 12 }}>
                  <img
                    src={courseData.instructor.avatar}
                    alt="Instructor avatar preview"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {!cameraOpen ? (
                  <button type="button" className="secondary-button" onClick={startCamera}>
                    Use Camera
                  </button>
                ) : (
                  <>
                    <button type="button" className="primary-button" onClick={captureInstructorAvatar}>
                      Take Photo
                    </button>

                    <button type="button" className="secondary-button" onClick={stopCamera}>
                      Stop
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
                    >
                      Switch Camera
                    </button>
                  </>
                )}
              </div>

              {cameraError && (
                <p style={{ marginTop: 10, color: 'crimson' }}>{cameraError}</p>
              )}

              {cameraOpen && (
                <div style={{ marginTop: 12 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      maxWidth: 420,
                      height: 260,
                      background: '#000',
                      borderRadius: 12
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              )}

              <p className="section-subtitle" style={{ marginTop: 10 }}>
              </p>
            </div>
          </div>
            
        );

      case 3:
        return (
          <div className="form-section">
            <h2>Pricing Details</h2>
            <p className="section-subtitle">Set the price for your course</p>

            <div className="form-row">
              <div className="form-group">
                <label>Price Amount</label>
                <input
                  type="number"
                  value={courseData.pricing.amount}
                  onChange={(e) => handleInputChange('pricing', 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 299"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  value={courseData.pricing.currency}
                  onChange={(e) => handleInputChange('pricing', 'currency', e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Pricing Type</label>
              <select
                value={courseData.pricing.type}
                onChange={(e) => handleInputChange('pricing', 'type', e.target.value)}
              >
                <option value="one-time">One-time payment</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-section modules-section">
            <h2>Course Modules</h2>
            <p className="section-subtitle">Create modules with overview, learning outcomes, materials, and assignments</p>

            <ModuleBuilder
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
              onSave={handleModuleSave}
              newOutcome={newOutcome}
              setNewOutcome={setNewOutcome}
              addLearningOutcome={addLearningOutcome}
              removeLearningOutcome={removeLearningOutcome}
            />

            {courseData.modules.length > 0 && (
              <div className="modules-list">
                <h3>Course Modules ({courseData.modules.length})</h3>
                {courseData.modules.map((module, index) => (
                  <div key={index} className="module-card">
                    <div className="module-header">
                      <div>
                        <h4>Module {index + 1}: {module.title}</h4>
                        <p className="module-overview">{module.overview}</p>
                      </div>
                      <button onClick={() => removeModule(index)} className="remove-button">
                        Remove
                      </button>
                    </div>
                    
                    <div className="module-details">
                      <div className="detail-section">
                        <strong>Learning Outcomes:</strong> {module.learningOutcomes.length}
                      </div>
                      <div className="detail-section">
                        <strong>Materials:</strong> {' '}
                        {module.learningMaterials.readings.length} readings, {' '}
                        {module.learningMaterials.podcasts.length} podcasts, {' '}
                        {module.learningMaterials.videos.length} videos
                      </div>
                      {module.assignment && (
                        <div className="detail-section">
                          <strong>Assignment:</strong> {module.assignment.title}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="form-section">
            <h2>Final Test</h2>
            <p className="section-subtitle">Create a final test to assess student learning</p>

            <div className="form-group">
              <label>Test Title</label>
              <input
                type="text"
                value={courseData.finalTest.title}
                onChange={(e) => handleInputChange('finalTest', 'title', e.target.value)}
                placeholder="Final Test"
              />
            </div>

            <div className="form-group">
              <label>Test Description</label>
              <textarea
                value={courseData.finalTest.description}
                onChange={(e) => handleInputChange('finalTest', 'description', e.target.value)}
                placeholder="Description of the final test..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Passing Score (%)</label>
                <input
                  type="number"
                  value={courseData.finalTest.passingScore}
                  onChange={(e) => handleInputChange('finalTest', 'passingScore', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Time Limit (minutes, 0 = no limit)</label>
                <input
                  type="number"
                  value={courseData.finalTest.timeLimit}
                  onChange={(e) => handleInputChange('finalTest', 'timeLimit', parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>

            <div className="question-builder">
              <h4>Add Test Questions</h4>

              <div className="form-group">
                <label>Question</label>
                <input
                  type="text"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  placeholder="Enter your question..."
                />
              </div>

              <div className="form-group">
                <label>Answer Options</label>
                {currentQuestion.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...currentQuestion.options];
                      newOptions[index] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                    style={{ marginBottom: '8px' }}
                  />
                ))}
              </div>

              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                >
                  <option value="">Select correct answer...</option>
                  {currentQuestion.options.map((option, index) => (
                    <option key={index} value={index}>{option || `Option ${index + 1}`}</option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={addQuestionToTest} className="add-button">
                Add Question
              </button>

              {courseData.finalTest.questions.length > 0 && (
                <div className="items-list">
                  <h5>Test Questions ({courseData.finalTest.questions.length})</h5>
                  {courseData.finalTest.questions.map((q, index) => (
                    <div key={index} className="list-item">
                      <span>{index + 1}. {q.question}</span>
                      <button onClick={() => removeQuestionFromTest(index)} className="remove-button">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="form-section">
            <h2>Completion Badge</h2>
            <p className="section-subtitle">Design a badge that students will earn upon completing the course</p>

            <div className="form-group">
              <label>Badge Name</label>
              <input
                type="text"
                value={courseData.badge.name}
                onChange={(e) => handleInputChange('badge', 'name', e.target.value)}
                placeholder="e.g., Freelance Branding Expert"
              />
            </div>

            <div className="form-group">
              <label>Badge Description</label>
              <textarea
                value={courseData.badge.description}
                onChange={(e) => handleInputChange('badge', 'description', e.target.value)}
                placeholder="Description of what this badge represents..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Badge Color</label>
              <input
                type="color"
                value={courseData.badge.color}
                onChange={(e) => handleInputChange('badge', 'color', e.target.value)}
              />
            </div>

            <ImageUpload
              value={courseData.badge.imageUrl}
              onChange={(url) => handleInputChange('badge', 'imageUrl', url)}
              label="Badge Image (optional)"
            />

            {courseData.badge.name && (
              <div className="badge-preview">
                <h4>Badge Preview</h4>
                <div 
                  className="preview-badge"
                  style={{ backgroundColor: courseData.badge.color }}
                >
                  {courseData.badge.imageUrl ? (
                    <img src={courseData.badge.imageUrl} alt={courseData.badge.name} />
                  ) : (
                    <span className="badge-emoji">🏆</span>
                  )}
                </div>
                <p><strong>{courseData.badge.name}</strong></p>
                <p>{courseData.badge.description}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>

        <h1>{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
        <p className="page-subtitle">Fill in the details to create a new course</p>

        <div className="steps-indicator">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${currentStep === index + 1 ? 'active' : ''} ${
                currentStep > index + 1 ? 'completed' : ''
              }`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{step}</div>
            </div>
          ))}
        </div>

        <div className="form-container">
          {renderStepContent()}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="secondary-button"
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="primary-button"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="primary-button"
            >
              {isEditMode ? 'Update Course' : 'Create Course'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;
