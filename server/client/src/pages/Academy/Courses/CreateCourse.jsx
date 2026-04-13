import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiAward } from "react-icons/fi";
import ImageUpload from "../../../components/ImageUpload";
import ModuleBuilder from "./ModuleBuilder";

const inputClasses =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark";
const textareaClasses =
  "w-full min-h-[140px] rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark";
const primaryButtonClasses =
  "inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary disabled:cursor-not-allowed disabled:opacity-60";
const dangerButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-error/20 bg-[#fff2f2] px-4 py-2 text-sm font-semibold text-error transition hover:bg-[#ffe8e6]";
const panelClasses = "rounded-[28px] border border-border bg-light-tertiary p-5";

function CreateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: "",
    overview: "",
    duration: "",
    difficulty: "Beginner",
    category: "",
    thumbnail: "",
    isLiteVersion: false,
    instructor: {
      name: "",
      title: "",
      bio: "",
      avatar: ""
    },
    pricing: {
      amount: 0,
      currency: "USD",
      type: "one-time"
    },
    modules: [],
    finalTest: {
      title: "Final Test",
      description: "",
      passingScore: 70,
      timeLimit: 0,
      questions: []
    },
    badge: {
      name: "",
      description: "",
      color: "#F4663E",
      imageUrl: ""
    }
  });
  const [currentModule, setCurrentModule] = useState({
    title: "",
    overview: "",
    learningOutcomes: [],
    learningMaterials: {
      readings: [],
      podcasts: [],
      videos: []
    },
    assignment: null
  });
  const [newOutcome, setNewOutcome] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  const steps = [
    "Basic Info",
    "Instructor",
    "Pricing",
    "Modules",
    "Final Test",
    "Badge"
  ];

  useEffect(() => {
    if (!courseId) {
      return;
    }

    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/academy/courses/${courseId}`, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const course = await response.json();

        setCourseData({
          title: course.title || "",
          overview: course.description || "",
          duration: course.duration || "",
          difficulty: course.difficulty || "Beginner",
          category: course.category || "",
          thumbnail: course.thumbnail || "",
          isLiteVersion: course.isLiteVersion || false,
          instructor: {
            _id: course.instructor?._id,
            name: course.instructor?.name || "",
            title: course.instructor?.title || "",
            bio: course.instructor?.bio || "",
            avatar: course.instructor?.avatar || "",
            email: course.instructor?.email || ""
          },
          pricing: {
            amount: course.pricing?.amount || 0,
            currency: course.pricing?.currency || "USD",
            type: course.pricing?.type || "one-time"
          },
          modules: course.modules || [],
          finalTest: course.finalTest || {
            title: "Final Test",
            description: "",
            passingScore: 70,
            timeLimit: 0,
            questions: []
          },
          badge: course.badge || {
            name: "",
            description: "",
            color: "#F4663E",
            imageUrl: ""
          }
        });

        setIsEditMode(true);
      } catch (error) {
        console.error("Error fetching course:", error);
        alert("Failed to load course for editing");
        navigate("/instructor/dashboard");
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setCourseData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
      return;
    }

    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  const addLearningOutcome = () => {
    if (!newOutcome.trim()) return;

    setCurrentModule((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, newOutcome]
    }));
    setNewOutcome("");
  };

  const removeLearningOutcome = (index) => {
    setCurrentModule((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter(
        (_, outcomeIndex) => outcomeIndex !== index
      )
    }));
  };

  const handleModuleSave = (module) => {
    setCourseData((prev) => ({
      ...prev,
      modules: [...prev.modules, { ...module, order: prev.modules.length }]
    }));

    setCurrentModule({
      title: "",
      overview: "",
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
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, moduleIndex) => moduleIndex !== index)
    }));
  };

  const addQuestionToTest = () => {
    if (!currentQuestion.question) {
      alert("Please enter a question");
      return;
    }
    if (currentQuestion.options.some((option) => !option.trim())) {
      alert("Please fill in all answer options");
      return;
    }
    if (currentQuestion.correctAnswer === "") {
      alert("Please specify the correct answer");
      return;
    }

    setCourseData((prev) => ({
      ...prev,
      finalTest: {
        ...prev.finalTest,
        questions: [
          ...prev.finalTest.questions,
          {
            question: currentQuestion.question,
            options: currentQuestion.options,
            correctAnswer: Number(currentQuestion.correctAnswer),
            points: currentQuestion.points
          }
        ]
      }
    }));

    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1
    });
  };

  const removeQuestionFromTest = (index) => {
    setCourseData((prev) => ({
      ...prev,
      finalTest: {
        ...prev.finalTest,
        questions: prev.finalTest.questions.filter(
          (_, questionIndex) => questionIndex !== index
        )
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!courseData.title || !courseData.overview) {
        alert("Please fill in course title and overview");
        return;
      }
      if (!courseData.instructor.name) {
        alert("Please fill in instructor information");
        return;
      }
      if (courseData.modules.length === 0) {
        alert("Please add at least one module");
        return;
      }

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
        modules: courseData.modules.map((module) => ({
          title: module.title,
          description: module.overview || module.description,
          order: module.order,
          learningOutcomes: module.learningOutcomes,
          learningMaterials: module.learningMaterials,
          assignment: module.assignment,
          lessons: module.lessons || []
        })),
        finalTest:
          courseData.finalTest.questions.length > 0 ? courseData.finalTest : null,
        badge: courseData.badge
      };

      const url = isEditMode
        ? `/api/academy/courses/${courseId}`
        : "/api/academy/courses";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(backendData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Server error response:", responseData);
        alert(
          `Failed to ${isEditMode ? "update" : "create"} course: ${
            responseData.error || "Unknown error"
          }`
        );
        return;
      }

      alert(`Course ${isEditMode ? "updated" : "created"} successfully!`);
      navigate("/instructor/dashboard");
    } catch (error) {
      console.error("Error saving course:", error);
      alert(
        `Failed to ${isEditMode ? "update" : "create"} course: ${error.message}`
      );
    }
  };

  const startCamera = async () => {
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      const message =
        error?.name === "NotAllowedError"
          ? "Camera permission was denied."
          : error?.name === "NotFoundError"
          ? "No camera device found."
          : "Could not access the camera.";

      setCameraError(message);
      setCameraOpen(false);
    }
  };

  const stopCamera = () => {
    const stream = cameraStreamRef.current || cameraStream;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    cameraStreamRef.current = null;
    setCameraStream(null);
    setCameraOpen(false);
  };

  const captureInstructorAvatar = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      async (blob) => {
        try {
          if (!blob) throw new Error("Failed to capture image");

          const form = new FormData();
          form.append("image", blob, "instructor-avatar.png");

          const response = await fetch("/api/upload/image", {
            method: "POST",
            body: form,
            credentials: "include"
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Upload failed");
          }

          handleInputChange("instructor", "avatar", data.url);
          stopCamera();
        } catch (error) {
          console.error("Avatar upload failed:", error);
          setCameraError(error.message || "Failed to upload image");
        }
      },
      "image/png",
      0.92
    );
  };

  useEffect(() => {
    if (!cameraOpen || !cameraStream || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = cameraStream;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn("Video play error:", error);
      }
    };

    video.onloadedmetadata = playVideo;
    playVideo();
  }, [cameraOpen, cameraStream]);

  useEffect(() => {
    return () => {
      const stream = cameraStreamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, []);

  const renderStepHeader = (title, description) => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Step {currentStep}
      </p>
      <h2 className="mt-2 text-3xl font-bold text-dark">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-dark-secondary">{description}</p>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {renderStepHeader(
              "Course information",
              "Set the core details learners will see before enrolling."
            )}

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(event) =>
                    handleInputChange(null, "title", event.target.value)
                  }
                  placeholder="e.g., Branding Yourself in Freelancing"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Course Overview *
                </label>
                <textarea
                  value={courseData.overview}
                  onChange={(event) =>
                    handleInputChange(null, "overview", event.target.value)
                  }
                  placeholder="Describe what students will learn and why it matters..."
                  rows={6}
                  className={textareaClasses}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={courseData.duration}
                    onChange={(event) =>
                      handleInputChange(null, "duration", event.target.value)
                    }
                    placeholder="e.g., 4 weeks"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Difficulty Level
                  </label>
                  <select
                    value={courseData.difficulty}
                    onChange={(event) =>
                      handleInputChange(null, "difficulty", event.target.value)
                    }
                    className={inputClasses}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Category
                </label>
                <input
                  type="text"
                  value={courseData.category}
                  onChange={(event) =>
                    handleInputChange(null, "category", event.target.value)
                  }
                  placeholder="e.g., Digital Marketing, Design, Development"
                  className={inputClasses}
                />
              </div>

              <div className={panelClasses}>
                <ImageUpload
                  value={courseData.thumbnail}
                  onChange={(url) => handleInputChange(null, "thumbnail", url)}
                  label="Course Thumbnail"
                />
              </div>

              <label className="flex items-start gap-3 rounded-[28px] border border-border bg-light-tertiary px-5 py-4">
                <input
                  type="checkbox"
                  checked={courseData.isLiteVersion}
                  onChange={(event) =>
                    handleInputChange(null, "isLiteVersion", event.target.checked)
                  }
                  className="mt-1 h-5 w-5 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm leading-7 text-dark-secondary">
                  This is a Lite version with limited free content.
                </span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {renderStepHeader(
              "Instructor profile",
              "Add the instructor details learners will see across the course."
            )}

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  value={courseData.instructor.name}
                  onChange={(event) =>
                    handleInputChange("instructor", "name", event.target.value)
                  }
                  placeholder="e.g., Dr. Sarah Johnson"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Instructor Title or Role
                </label>
                <input
                  type="text"
                  value={courseData.instructor.title}
                  onChange={(event) =>
                    handleInputChange("instructor", "title", event.target.value)
                  }
                  placeholder="e.g., Senior Marketing Consultant"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Instructor Bio
                </label>
                <textarea
                  value={courseData.instructor.bio}
                  onChange={(event) =>
                    handleInputChange("instructor", "bio", event.target.value)
                  }
                  placeholder="Brief overview of the instructor's background and expertise..."
                  rows={5}
                  className={textareaClasses}
                />
              </div>

              <div className={panelClasses}>
                <ImageUpload
                  value={courseData.instructor.avatar}
                  onChange={(url) => handleInputChange("instructor", "avatar", url)}
                  label="Instructor Avatar"
                />
              </div>

              <div className={panelClasses}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-dark">Camera Capture</h3>
                    <p className="mt-2 text-sm leading-7 text-dark-secondary">
                      Use the camera if you want to capture the instructor avatar live.
                    </p>
                  </div>

                  {courseData.instructor.avatar ? (
                    <div className="flex items-center gap-4 rounded-[24px] border border-border bg-white p-4">
                      <img
                        src={courseData.instructor.avatar}
                        alt="Instructor avatar preview"
                        className="h-24 w-24 rounded-full border border-border object-cover"
                      />
                      <p className="text-sm leading-7 text-dark-secondary">
                        Current avatar preview
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {!cameraOpen ? (
                      <button
                        type="button"
                        className={secondaryButtonClasses}
                        onClick={startCamera}
                      >
                        Use Camera
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={primaryButtonClasses}
                          onClick={captureInstructorAvatar}
                        >
                          Take Photo
                        </button>

                        <button
                          type="button"
                          className={secondaryButtonClasses}
                          onClick={stopCamera}
                        >
                          Stop
                        </button>

                        <button
                          type="button"
                          className={secondaryButtonClasses}
                          onClick={() =>
                            setFacingMode((mode) =>
                              mode === "user" ? "environment" : "user"
                            )
                          }
                        >
                          Switch Camera
                        </button>
                      </>
                    )}
                  </div>

                  {cameraError ? (
                    <p className="text-sm text-error">{cameraError}</p>
                  ) : null}

                  {cameraOpen ? (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="aspect-video w-full max-w-2xl rounded-[28px] border border-border bg-black object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {renderStepHeader(
              "Pricing details",
              "Configure how learners will purchase or subscribe to the course."
            )}

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Price Amount
                  </label>
                  <input
                    type="number"
                    value={courseData.pricing.amount}
                    onChange={(event) =>
                      handleInputChange(
                        "pricing",
                        "amount",
                        parseFloat(event.target.value) || 0
                      )
                    }
                    placeholder="e.g., 299"
                    min="0"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Currency
                  </label>
                  <select
                    value={courseData.pricing.currency}
                    onChange={(event) =>
                      handleInputChange("pricing", "currency", event.target.value)
                    }
                    className={inputClasses}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Pricing Type
                </label>
                <select
                  value={courseData.pricing.type}
                  onChange={(event) =>
                    handleInputChange("pricing", "type", event.target.value)
                  }
                  className={inputClasses}
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
            {renderStepHeader(
              "Course modules",
              "Create the modules, outcomes, learning materials, and optional assignments."
            )}

            <ModuleBuilder
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
              onSave={handleModuleSave}
              newOutcome={newOutcome}
              setNewOutcome={setNewOutcome}
              addLearningOutcome={addLearningOutcome}
              removeLearningOutcome={removeLearningOutcome}
            />

            {courseData.modules.length > 0 ? (
              <div className={panelClasses}>
                <div>
                  <h3 className="text-2xl font-bold text-dark">
                    Course Modules ({courseData.modules.length})
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-dark-secondary">
                    Review the modules currently attached to this course.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {courseData.modules.map((module, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-border bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xl font-bold text-dark">
                              Module {index + 1}: {module.title}
                            </h4>
                            <p className="mt-2 text-sm leading-7 text-dark-secondary">
                              {module.overview}
                            </p>
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl bg-light-tertiary px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                                Outcomes
                              </p>
                              <p className="mt-2 text-sm font-semibold text-dark">
                                {module.learningOutcomes.length}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-light-tertiary px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                                Materials
                              </p>
                              <p className="mt-2 text-sm font-semibold text-dark">
                                {module.learningMaterials.readings.length} readings,{" "}
                                {module.learningMaterials.podcasts.length} podcasts,{" "}
                                {module.learningMaterials.videos.length} videos
                              </p>
                            </div>

                            <div className="rounded-2xl bg-light-tertiary px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                                Assignment
                              </p>
                              <p className="mt-2 text-sm font-semibold text-dark">
                                {module.assignment ? module.assignment.title : "None"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          className={dangerButtonClasses}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {renderStepHeader(
              "Final test",
              "Create the assessment learners can complete at the end of the course."
            )}

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Test Title
                </label>
                <input
                  type="text"
                  value={courseData.finalTest.title}
                  onChange={(event) =>
                    handleInputChange("finalTest", "title", event.target.value)
                  }
                  placeholder="Final Test"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Test Description
                </label>
                <textarea
                  value={courseData.finalTest.description}
                  onChange={(event) =>
                    handleInputChange(
                      "finalTest",
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Description of the final test..."
                  rows={4}
                  className={textareaClasses}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={courseData.finalTest.passingScore}
                    onChange={(event) =>
                      handleInputChange(
                        "finalTest",
                        "passingScore",
                        parseInt(event.target.value, 10)
                      )
                    }
                    min="0"
                    max="100"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">
                    Time Limit (minutes, 0 = no limit)
                  </label>
                  <input
                    type="number"
                    value={courseData.finalTest.timeLimit}
                    onChange={(event) =>
                      handleInputChange(
                        "finalTest",
                        "timeLimit",
                        parseInt(event.target.value, 10)
                      )
                    }
                    min="0"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className={panelClasses}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-dark">
                      Add Test Questions
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-dark-secondary">
                      Add multiple-choice questions for the final assessment.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Question
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.question}
                      onChange={(event) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          question: event.target.value
                        }))
                      }
                      placeholder="Enter your question..."
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Answer Options
                    </label>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          value={option}
                          onChange={(event) => {
                            const nextOptions = [...currentQuestion.options];
                            nextOptions[index] = event.target.value;
                            setCurrentQuestion((prev) => ({
                              ...prev,
                              options: nextOptions
                            }));
                          }}
                          placeholder={`Option ${index + 1}`}
                          className={inputClasses}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">
                      Correct Answer
                    </label>
                    <select
                      value={currentQuestion.correctAnswer}
                      onChange={(event) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          correctAnswer: event.target.value
                        }))
                      }
                      className={inputClasses}
                    >
                      <option value="">Select correct answer...</option>
                      {currentQuestion.options.map((option, index) => (
                        <option key={index} value={index}>
                          {option || `Option ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestionToTest}
                    className={primaryButtonClasses}
                  >
                    Add Question
                  </button>

                  {courseData.finalTest.questions.length > 0 ? (
                    <div className="space-y-4 rounded-[24px] border border-border bg-white p-5">
                      <h4 className="text-xl font-bold text-dark">
                        Test Questions ({courseData.finalTest.questions.length})
                      </h4>

                      <div className="space-y-3">
                        {courseData.finalTest.questions.map((question, index) => (
                          <div
                            key={index}
                            className="flex flex-col gap-3 rounded-[20px] border border-border bg-light-tertiary p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="text-sm leading-7 text-dark">
                              {index + 1}. {question.question}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuestionFromTest(index)}
                              className={dangerButtonClasses}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {renderStepHeader(
              "Completion badge",
              "Set the badge learners will receive after they finish the course."
            )}

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Badge Name
                </label>
                <input
                  type="text"
                  value={courseData.badge.name}
                  onChange={(event) =>
                    handleInputChange("badge", "name", event.target.value)
                  }
                  placeholder="e.g., Freelance Branding Expert"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Badge Description
                </label>
                <textarea
                  value={courseData.badge.description}
                  onChange={(event) =>
                    handleInputChange("badge", "description", event.target.value)
                  }
                  placeholder="Description of what this badge represents..."
                  rows={4}
                  className={textareaClasses}
                />
              </div>

              <div className={panelClasses}>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Badge Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={courseData.badge.color}
                    onChange={(event) =>
                      handleInputChange("badge", "color", event.target.value)
                    }
                    className="h-12 w-20 cursor-pointer rounded-2xl border border-border bg-white p-1"
                  />
                  <span className="text-sm font-semibold text-dark-secondary">
                    {courseData.badge.color}
                  </span>
                </div>
              </div>

              <div className={panelClasses}>
                <ImageUpload
                  value={courseData.badge.imageUrl}
                  onChange={(url) => handleInputChange("badge", "imageUrl", url)}
                  label="Badge Image (optional)"
                />
              </div>

              {courseData.badge.name ? (
                <div className={panelClasses}>
                  <h3 className="text-2xl font-bold text-dark">Badge Preview</h3>
                  <div className="mt-6 flex flex-col items-center text-center">
                    <div
                      className="flex h-32 w-32 items-center justify-center rounded-full shadow-card"
                      style={{ backgroundColor: courseData.badge.color }}
                    >
                      {courseData.badge.imageUrl ? (
                        <img
                          src={courseData.badge.imageUrl}
                          alt={courseData.badge.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <FiAward className="text-5xl text-white" />
                      )}
                    </div>
                    <p className="mt-4 text-lg font-semibold text-dark">
                      {courseData.badge.name}
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-dark-secondary">
                      {courseData.badge.description}
                    </p>
                  </div>
                </div>
              ) : null}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Courses
            </p>
            <h1 className="mt-2 text-4xl font-bold text-dark sm:text-5xl">
              {isEditMode ? "Edit Course" : "Create New Course"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-dark-secondary">
              Fill in the details, build the learning path, and configure the final
              assessment for this course.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isComplete = currentStep > stepNumber;

              return (
                <button
                  key={step}
                  type="button"
                  className={`inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-dark text-white shadow-md"
                      : "bg-white text-dark hover:-translate-y-0.5 hover:bg-light-secondary"
                  }`}
                  onClick={() => setCurrentStep(stepNumber)}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                      isActive
                        ? "bg-white/15 text-white"
                        : isComplete
                        ? "bg-accent text-white"
                        : "bg-light-tertiary text-dark"
                    }`}
                  >
                    {stepNumber}
                  </span>
                  <span>{step}</span>
                </button>
              );
            })}
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
            className={secondaryButtonClasses}
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className={primaryButtonClasses}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className={primaryButtonClasses}
            >
              {isEditMode ? "Update Course" : "Create Course"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;
