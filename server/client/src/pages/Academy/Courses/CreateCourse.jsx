import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import ImageUpload from '../../../components/ImageUpload';
import ModuleBuilder from './ModuleBuilder';
import AlertModal from '../../../components/UI/AlertModal';

function CreateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams(); 
  const [searchParams] = useSearchParams();
  const draftIdFromUrl = searchParams.get('draftId');
  const [isEditMode, setIsEditMode] = useState(false); 
  const [currentStep, setCurrentStep] = useState(1);
  const [aiOutcomesLoading, setAiOutcomesLoading] = useState(false);
  const [draftId, setDraftId] = useState(draftIdFromUrl || null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const showAlert = (title, message, type = "error") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

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

  const fetchCourseData = async () => {
    console.log('=== FETCH COURSE DATA CALLED ===');
  console.log('courseId from useParams:', courseId);
  console.log('Full URL will be:', `/api/academy/courses/${courseId}`);
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
          _id: course.instructor?._id, 
          name: course.instructor?.name || '',
          title: course.instructor?.title || '',
          bio: course.instructor?.bio || '',
          avatar: course.instructor?.avatar || '',
          email: course.instructor?.email || ''
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
      showAlert("Error", "Failed to load course for editing");
      navigate('/instructor/dashboard');
    }
  };

    // Fetch course data if editing
useEffect(() => {
  console.log('=== USEFFECT RUNNING ===');
  console.log('courseId:', courseId);
  if (courseId) {
    console.log('courseId exists, calling fetchCourseData');
    fetchCourseData();
  } else {
    console.log('courseId is undefined or null');
  }
}, [courseId]);

  // Load draft if draftId is present in URL
  useEffect(() => {
    if (!draftIdFromUrl || courseId) return;
    const loadDraft = async () => {
      try {
        const res = await fetch(`/api/academy/drafts/${draftIdFromUrl}`, { credentials: 'include' });
        if (res.ok) {
          const draft = await res.json();
          if (draft.contentData && Object.keys(draft.contentData).length > 0) {
            setCourseData(prev => ({ ...prev, ...draft.contentData }));
            setLastSaved(new Date(draft.lastSavedAt));
          }
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    };
    loadDraft();
  }, [draftIdFromUrl, courseId]);

  // Auto-save draft (debounced 2s after changes)
  const saveDraft = useCallback(async (data) => {
    if (isEditMode || isSavingDraft) return;
    setIsSavingDraft(true);
    try {
      if (draftId) {
        const res = await fetch(`/api/academy/drafts/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ contentData: data })
        });
        if (res.ok) setLastSaved(new Date());
      } else {
        const res = await fetch('/api/academy/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ contentType: 'course', contentData: data })
        });
        if (res.ok) {
          const newDraft = await res.json();
          setDraftId(newDraft._id);
          setLastSaved(new Date());
        }
      }
    } catch (err) {
      console.error('Auto-save draft error:', err);
    } finally {
      setIsSavingDraft(false);
    }
  }, [draftId, isEditMode, isSavingDraft]);

  useEffect(() => {
    if (isEditMode) return;
    const timer = setTimeout(() => {
      if (courseData.title || courseData.overview) {
        saveDraft(courseData);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [courseData, isEditMode, saveDraft]);

  const validateStep = (step) => {
    if (step === 1) {
      if (!courseData.title.trim() || !courseData.overview.trim()) {
        showAlert("Validation Error", "Please fill in all required fields (Course Title, Course Overview) in Step 1.");
        return false;
      }
    } else if (step === 2) {
      if (!courseData.instructor.name.trim()) {
        showAlert("Validation Error", "Instructor Name is required in Step 2.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleStepClick = (targetStep) => {
    if (targetStep > currentStep) {
      for (let i = currentStep; i < targetStep; i++) {
        if (!validateStep(i)) return;
      }
    }
    setCurrentStep(targetStep);
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
      showAlert('Validation Error', 'Please enter a question');
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      showAlert('Validation Error', 'Please fill in all answer options');
      return;
    }
    if (currentQuestion.correctAnswer === '') {
      showAlert('Validation Error', 'Please specify the correct answer');
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
      showAlert('Validation Error', 'Please fill in course title and overview');
      return;
    }
    if (!courseData.instructor.name) {
      showAlert('Validation Error', 'Please fill in instructor information');
      return;
    }
    if (courseData.modules.length === 0) {
      showAlert('Validation Error', 'Please add at least one module');
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
      showAlert('Error', `Failed to ${isEditMode ? 'update' : 'create'} course: ${responseData.error || 'Unknown error'}`);
      return;
    }

    // Delete the draft on successful publish
    if (draftId) {
      try {
        await fetch(`/api/academy/drafts/${draftId}`, { method: 'DELETE', credentials: 'include' });
      } catch (e) { /* ignore cleanup errors */ }
    }

    showAlert('Success', `Course ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
    setTimeout(() => navigate('/instructor/dashboard'), 1500);

  } catch (err) {
    console.error('Error saving course:', err);
    showAlert('Error', `Failed to ${isEditMode ? 'update' : 'create'} course: ${err.message}`);
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

  const captureInstructorAvatar = async () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  canvas.toBlob(async (blob) => {
    try {
      if (!blob) throw new Error("Failed to capture image");

      const form = new FormData();
      form.append("image", blob, "instructor-avatar.png");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: form,
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Store Cloudinary URL (not base64)
      handleInputChange("instructor", "avatar", data.url);

      stopCamera();
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setCameraError(err.message || "Failed to upload image");
    }
  }, "image/png", 0.92);
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

  const handleGenerateOutcomesForCurrentModule = async () => {
    try {
      if (!courseData.title?.trim() || !courseData.overview?.trim()) {
        alert("Please fill in course title and overview first.");
        return;
      }
      if (!currentModule.title?.trim()) {
        alert("Please enter a module title first.");
        return;
      }

      setAiOutcomesLoading(true);

      const res = await fetch("/api/ai/learning-outcomes/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          course: { title: courseData.title, description: courseData.overview },
          module: {
            ...currentModule,
            description: currentModule.overview || currentModule.description || "",
          },
          count: 6,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate outcomes");
        return;
      }

      setCurrentModule(prev => ({
        ...prev,
        learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [],
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to generate outcomes");
    } finally {
      setAiOutcomesLoading(false);
    }
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Step 1
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">Course Information</h2>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                Basic details about your course
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Course Title *</label>
                <input
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                  type="text"
                  value={courseData.title}
                  onChange={(e) => handleInputChange(null, 'title', e.target.value)}
                  placeholder="e.g., Branding Yourself in Freelancing"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Course Overview *</label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 leading-7 text-dark outline-none transition focus:border-dark"
                  value={courseData.overview}
                  onChange={(e) => handleInputChange(null, 'overview', e.target.value)}
                  placeholder="In today's competitive freelance market, your brand is your most powerful asset..."
                  rows={6}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Duration</label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                    type="text"
                    value={courseData.duration}
                    onChange={(e) => handleInputChange(null, 'duration', e.target.value)}
                    placeholder="e.g., 4 weeks"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Difficulty Level</label>
                  <select
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark appearance-none"
                    value={courseData.difficulty}
                    onChange={(e) => handleInputChange(null, 'difficulty', e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Category</label>
                <input
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                  type="text"
                  value={courseData.category}
                  onChange={(e) => handleInputChange(null, 'category', e.target.value)}
                  placeholder="e.g., Digital Marketing, Design, Development"
                />
              </div>

              <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                <ImageUpload
                  value={courseData.thumbnail}
                  onChange={(url) => handleInputChange(null, 'thumbnail', url)}
                  label="Course Thumbnail"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-border text-dark focus:ring-dark"
                    checked={courseData.isLiteVersion}
                    onChange={(e) => handleInputChange(null, 'isLiteVersion', e.target.checked)}
                  />
                  <span className="text-sm font-semibold text-dark">This is a Lite version (free tier with limited content)</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Step 2
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">Instructor Information</h2>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                Details about the course instructor
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Instructor Name *</label>
                <input
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                  type="text"
                  value={courseData.instructor.name}
                  onChange={(e) => handleInputChange('instructor', 'name', e.target.value)}
                  placeholder="e.g., Dr. Sarah Johnson"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Instructor Title/Role</label>
                <input
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                  type="text"
                  value={courseData.instructor.title}
                  onChange={(e) => handleInputChange('instructor', 'title', e.target.value)}
                  placeholder="e.g., Senior Marketing Consultant"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Instructor Bio</label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 leading-7 text-dark outline-none transition focus:border-dark"
                  value={courseData.instructor.bio}
                  onChange={(e) => handleInputChange('instructor', 'bio', e.target.value)}
                  placeholder="Brief overview of the instructor's background and expertise..."
                  rows={4}
                />
              </div>

              <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                <ImageUpload
                  value={courseData.instructor.avatar}
                  onChange={(url) => handleInputChange('instructor', 'avatar', url)}
                  label="Instructor Avatar"
                />
              </div>
              
              <div className="pt-4 border-t border-border">
                <label className="mb-4 block text-sm font-semibold text-dark">Or take a photo</label>

                {courseData.instructor.avatar && (
                  <div className="mb-6">
                    <img
                      src={courseData.instructor.avatar}
                      alt="Instructor avatar preview"
                      className="h-24 w-24 rounded-full object-cover border border-border shadow-sm"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {!cameraOpen ? (
                    <button 
                      type="button" 
                      className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-bold text-dark transition hover:bg-light-secondary" 
                      onClick={startCamera}
                    >
                      Use Camera
                    </button>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="inline-flex items-center justify-center rounded-full bg-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-dark-secondary" 
                        onClick={captureInstructorAvatar}
                      >
                        Take Photo
                      </button>

                      <button 
                        type="button" 
                        className="inline-flex items-center justify-center rounded-full bg-error/10 text-error px-6 py-3 text-sm font-bold transition hover:bg-error/20" 
                        onClick={stopCamera}
                      >
                        Stop
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-bold text-dark transition hover:bg-light-secondary"
                        onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
                      >
                        Switch Camera
                      </button>
                    </>
                  )}
                </div>

                {cameraError && (
                  <p className="mt-4 text-sm font-semibold text-error">{cameraError}</p>
                )}

                {cameraOpen && (
                  <div className="mt-6 rounded-2xl overflow-hidden border-2 border-border max-w-[420px] bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-auto aspect-video object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Step 3
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">Pricing Details</h2>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                Set the price for your course
              </p>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Price Amount</label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                    type="number"
                    value={courseData.pricing.amount}
                    onChange={(e) => handleInputChange('pricing', 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 299"
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Currency</label>
                  <select
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark appearance-none"
                    value={courseData.pricing.currency}
                    onChange={(e) => handleInputChange('pricing', 'currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Pricing Type</label>
                <select
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark appearance-none"
                  value={courseData.pricing.type}
                  onChange={(e) => handleInputChange('pricing', 'type', e.target.value)}
                >
                  <option value="one-time">One-time payment</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Step 4
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">Course Modules</h2>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                Create modules with overview, learning outcomes, materials, and assignments
              </p>
            </div>

            <ModuleBuilder
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
              onSave={handleModuleSave}
              newOutcome={newOutcome}
              setNewOutcome={setNewOutcome}
              addLearningOutcome={addLearningOutcome}
              removeLearningOutcome={removeLearningOutcome}
              onGenerateOutcomes={handleGenerateOutcomesForCurrentModule}
              aiOutcomesLoading={aiOutcomesLoading}
            />

            {courseData.modules.length > 0 && (
              <div className="space-y-6 mt-12">
                <h3 className="text-2xl font-bold text-dark">Course Modules ({courseData.modules.length})</h3>
                <div className="space-y-4">
                  {courseData.modules.map((module, index) => (
                    <div key={index} className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-dark mb-1">Module {index + 1}: {module.title}</h4>
                          <p className="text-sm text-dark-secondary leading-6">{module.overview}</p>
                        </div>
                        <button 
                          onClick={() => removeModule(index)} 
                          className="inline-flex items-center justify-center rounded-full bg-error/10 text-error px-4 py-2 text-sm font-semibold transition hover:bg-error/20 flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm pt-4 border-t border-border">
                        <div className="rounded-2xl bg-light-tertiary px-4 py-2 border border-border">
                          <strong className="text-dark">Learning Outcomes:</strong> <span className="text-dark-secondary">{module.learningOutcomes.length}</span>
                        </div>
                        <div className="rounded-2xl bg-light-tertiary px-4 py-2 border border-border">
                          <strong className="text-dark">Materials:</strong> <span className="text-dark-secondary">{module.learningMaterials.readings.length} readings, {module.learningMaterials.podcasts.length} podcasts, {module.learningMaterials.videos.length} videos</span>
                        </div>
                        {module.assignment && (
                          <div className="rounded-2xl bg-[#f0fdf4] px-4 py-2 border border-[#bbf7d0]">
                            <strong className="text-[#166534]">Assignment:</strong> <span className="text-[#15803d]">{module.assignment.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Step 5
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">Final Test</h2>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                Create a final test to assess student learning
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Test Title</label>
                <input
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                  type="text"
                  value={courseData.finalTest.title}
                  onChange={(e) => handleInputChange('finalTest', 'title', e.target.value)}
                  placeholder="Final Test"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Test Description</label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 leading-7 text-dark outline-none transition focus:border-dark"
                  value={courseData.finalTest.description}
                  onChange={(e) => handleInputChange('finalTest', 'description', e.target.value)}
                  placeholder="Description of the final test..."
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Passing Score (%)</label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                    type="number"
                    value={courseData.finalTest.passingScore}
                    onChange={(e) => handleInputChange('finalTest', 'passingScore', parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Time Limit (minutes, 0 = no limit)</label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                    type="number"
                    value={courseData.finalTest.timeLimit}
                    onChange={(e) => handleInputChange('finalTest', 'timeLimit', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-border mt-8">
                <h4 className="mb-6 text-xl font-bold text-dark">Add Test Questions</h4>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-dark">Question</label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                    type="text"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="Enter your question..."
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-dark">Answer Options</label>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <input
                        key={index}
                        className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-dark">Correct Answer</label>
                  <select
                    className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark appearance-none"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                  >
                    <option value="">Select correct answer...</option>
                    {currentQuestion.options.map((option, index) => (
                      <option key={index} value={index}>{option || `Option ${index + 1}`}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button" 
                  onClick={addQuestionToTest} 
                  className="inline-flex items-center justify-center rounded-full bg-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-dark-secondary"
                >
                  Add Question
                </button>

                {courseData.finalTest.questions.length > 0 && (
                  <div className="mt-8">
                    <h5 className="mb-4 text-lg font-bold text-dark">Test Questions ({courseData.finalTest.questions.length})</h5>
                    <div className="space-y-3">
                      {courseData.finalTest.questions.map((q, index) => (
                        <div key={index} className="flex items-center justify-between rounded-2xl border border-border bg-light-tertiary p-4">
                          <span className="text-dark font-medium"><span className="text-accent font-bold mr-2">{index + 1}.</span> {q.question}</span>
                          <button 
                            onClick={() => removeQuestionFromTest(index)} 
                            className="inline-flex items-center justify-center rounded-full bg-error/10 text-error px-4 py-2 text-sm font-semibold transition hover:bg-error/20 flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Step 6
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">Completion Badge</h2>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                Design a badge that students will earn upon completing the course
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Badge Name</label>
                <input
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-dark outline-none transition focus:border-dark"
                  type="text"
                  value={courseData.badge.name}
                  onChange={(e) => handleInputChange('badge', 'name', e.target.value)}
                  placeholder="e.g., Freelance Branding Expert"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Badge Description</label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-white px-5 py-4 leading-7 text-dark outline-none transition focus:border-dark"
                  value={courseData.badge.description}
                  onChange={(e) => handleInputChange('badge', 'description', e.target.value)}
                  placeholder="Description of what this badge represents..."
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Badge Color</label>
                <input
                  className="h-14 w-24 cursor-pointer rounded-xl border border-border bg-white p-1"
                  type="color"
                  value={courseData.badge.color}
                  onChange={(e) => handleInputChange('badge', 'color', e.target.value)}
                />
              </div>

              <div className="rounded-[28px] border border-border bg-light-tertiary p-5">
                <ImageUpload
                  value={courseData.badge.imageUrl}
                  onChange={(url) => handleInputChange('badge', 'imageUrl', url)}
                  label="Badge Image (optional)"
                />
              </div>

              {courseData.badge.name && (
                <div className="pt-8 border-t border-border mt-8">
                  <h4 className="mb-6 text-xl font-bold text-dark">Badge Preview</h4>
                  <div className="flex flex-col items-center justify-center rounded-[32px] border border-border bg-light-tertiary p-8 text-center max-w-sm mx-auto shadow-sm">
                    <div 
                      className="flex h-32 w-32 items-center justify-center rounded-full mb-6 shadow-md border-4 border-white"
                      style={{ backgroundColor: courseData.badge.color }}
                    >
                      {courseData.badge.imageUrl ? (
                        <img src={courseData.badge.imageUrl} alt={courseData.badge.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="text-5xl drop-shadow-sm">🏆</span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-dark mb-2">{courseData.badge.name}</p>
                    <p className="text-sm leading-6 text-dark-secondary">{courseData.badge.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Courses
              </p>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-4xl font-bold text-dark sm:text-5xl">
                  {isEditMode ? "Edit Course" : "Create New Course"}
                </h1>
                {!isEditMode && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                    Draft
                  </span>
                )}
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-dark-secondary">
                Fill in the details to create a new course
                {lastSaved && !isEditMode && (
                  <span className="ml-2 text-xs text-dark-secondary/60">
                    • Auto-saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {steps.map((step, index) => (
              <button
                key={index}
                type="button"
                className={`inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  currentStep === index + 1
                    ? "bg-dark text-white shadow-md"
                    : "bg-white text-dark hover:-translate-y-0.5 hover:bg-light-secondary"
                }`}
                onClick={() => handleStepClick(index + 1)}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    currentStep === index + 1
                      ? "bg-white/15 text-white"
                      : currentStep > index + 1
                      ? "bg-accent text-white"
                      : "bg-light-tertiary text-dark"
                  }`}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
          {renderStepContent()}
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditMode ? 'Update Course' : 'Create Course'}
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

export default CreateCourse;
