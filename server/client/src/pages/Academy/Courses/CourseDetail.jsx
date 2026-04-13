import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiLayers,
  FiPlayCircle,
  FiTrendingUp,
  FiUser
} from "react-icons/fi";

const fallbackLearningPoints = [
  "Build a clearer freelance positioning strategy.",
  "Create a stronger offer and client onboarding flow.",
  "Turn repeatable knowledge into a scalable system.",
  "Ship portfolio and messaging assets with confidence.",
  "Improve delivery quality and referral readiness.",
  "Apply practical lessons directly to real client work."
];

const includesId = (collection, targetId) => {
  if (!Array.isArray(collection) || !targetId) return false;

  return collection.some((item) => {
    if (!item) return false;
    if (typeof item === "string") return item === targetId;
    return item._id === targetId;
  });
};

const getShortDescription = (value) => {
  const text = String(value || "").trim();
  if (!text) {
    return "A structured, practical course built around real freelance work.";
  }

  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  return firstSentence.length > 180
    ? `${firstSentence.slice(0, 177).trimEnd()}...`
    : firstSentence;
};

const formatDate = (value) => {
  if (!value) return "Recently updated";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const formatMinutes = (value) => {
  const minutes = Number(value || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder
    ? `${hours}h ${String(remainder).padStart(2, "0")}m`
    : `${hours}h`;
};

const getLectureCount = (moduleItem) => {
  if (Array.isArray(moduleItem?.lessons)) return moduleItem.lessons.length;
  if (Array.isArray(moduleItem?.learningPoints)) return moduleItem.learningPoints.length;
  return moduleItem?.videoUrl ? 1 : 0;
};

const toYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.pathname.startsWith("/embed/")
    ) {
      return url;
    }

    if (parsedUrl.hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    const videoId = parsedUrl.searchParams.get("v");
    if (videoId) {
      const playlistId = parsedUrl.searchParams.get("list");
      return playlistId
        ? `https://www.youtube.com/embed/${videoId}?list=${encodeURIComponent(playlistId)}`
        : `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    return "";
  }

  return "";
};
/* global process */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiAward, FiBarChart2 } from 'react-icons/fi';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [enrolling, setEnrolling] = useState(false);
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include"
        });

        if (!response.ok) return;

        const userData = await response.json();
        setUser(userData);
      } catch (fetchError) {
        console.error("Failed to fetch user", fetchError);
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/academy/courses/${id}`);

        if (!response.ok) {
          throw new Error("Course not found");
        }

        if (!response.ok) throw new Error('Course not found');
        const data = await response.json();
        setCourse(data);
        setError(null);
      } catch (fetchError) {
        console.error("Error fetching course:", fetchError);
        setError(fetchError.message || "Unable to load course");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  useEffect(() => {
    setIsEnrolled(includesId(user?.enrolledCourses, course?._id));
  }, [user, course]);

  const toggleModule = (moduleKey) => {
    setExpandedModules((prev) => {
      const next = { ...prev, [moduleKey]: !prev[moduleKey] };

      if (prev[moduleKey]) {
        setOpenVideos((videoState) => ({ ...videoState, [moduleKey]: false }));
      }

      return next;
    });
  };

  const toggleVideo = (moduleKey) => {
    setOpenVideos((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleEnroll = async () => {
    if (!course) return;

    if (user && course) {
      setIsEnrolled(user.enrolledCourses?.includes(course._id));
    }
  }, [user, course]);

  const handleBack = () => navigate('/academy/courses');
  const handleContinueLearning = () => navigate(`/academy/courses/${id}/learn`);

  const handleEnroll = async () => {
    if (!course) return;
    if (!user) {
      navigate(`/login?returnTo=/academy/courses/${id}`);
      return;
    }
    try {
      setEnrolling(true);

      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId: course._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment initialization failed");
      }

      if (data.free) {
        alert("You've been enrolled in this free course!");
        setIsEnrolled(true);

        const refreshedUserResponse = await fetch("/api/users/me", {
          credentials: "include"
        });

        if (refreshedUserResponse.ok) {
          const refreshedUser = await refreshedUserResponse.json();
          setUser(refreshedUser);
        }

        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Invalid response from server");
    } catch (enrollError) {
      console.error("Enrollment failed:", enrollError);
      alert(`Enrollment failed: ${enrollError.message}`);
      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment initialization failed');
      if (data.free) {
        alert("You've been enrolled in this free course!");
        setIsEnrolled(true);
        const userRes = await fetch('/api/users/me', { credentials: 'include' });
        if (userRes.ok) setUser(await userRes.json());
        return;
      }
      if (data.url) { window.location.href = data.url; return; }
      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('Enrollment failed:', err);
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleContinueLearning = () => {
    navigate(`/academy/courses/${id}/learn`);
  };

  const handleBack = () => {
    navigate("/academy/courses");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <div className="rounded-3xl border border-border bg-white px-6 py-16 text-center text-dark-secondary shadow-card">
            Loading course...
          </div>
  const totalLessons = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-container">
          <div className="cd-loading">Loading course...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <button
            type="button"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
            onClick={handleBack}
          >
            <FiArrowLeft />
            <span>Back to Courses</span>
          </button>

          <div className="rounded-[32px] border border-border bg-white px-6 py-16 text-center shadow-card">
            <h1 className="text-3xl font-bold text-dark">Course Not Found</h1>
            <p className="mx-auto mt-4 max-w-2xl text-dark-secondary">
              {error || "The course you are looking for does not exist."}
            </p>
      <div className="cd-page">
        <div className="cd-container">
          <button className="cd-back-btn" onClick={handleBack}>
            <FiArrowLeft size={16} /> Back to Courses
          </button>
          <div className="cd-error">
            <h2>Course Not Found</h2>
            <p>{error || 'The course you are looking for does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const modules = Array.isArray(course.modules) ? course.modules : [];
  const lectureCount = modules.reduce(
    (total, moduleItem) => total + getLectureCount(moduleItem),
    0
  );
  const totalLength =
    formatMinutes(course.estimatedMinutes) || course.duration || "Self-paced";
  const priceAmount = Number(course.priceAmount ?? course.pricing?.amount ?? 0);
  const isSubscriptionCourse =
    course.subscription?.isSubscriptionCourse === true ||
    course.subscription?.isSubscriptionCourse === "true";
  const isFree = Boolean(course.isFree) || Boolean(course.isLiteVersion) || priceAmount === 0;
  const shortDescription = getShortDescription(course.description);
  const highlightSource = Array.isArray(course.learningPoints) && course.learningPoints.length
    ? course.learningPoints
    : modules.flatMap((moduleItem) =>
        Array.isArray(moduleItem.learningPoints) ? moduleItem.learningPoints : []
      );
  const highlights = (highlightSource.length ? highlightSource : fallbackLearningPoints).slice(0, 6);
  const heroMeta = [
    {
      icon: FiUser,
      label: "Instructor",
      value: course.instructor?.name || "UniFreelancer Academy"
    },
    {
      icon: FiCalendar,
      label: "Updated",
      value: formatDate(course.updatedAt || course.createdAt)
    },
    {
      icon: FiClock,
      label: "Duration",
      value: totalLength
    }
  ];

  return (
    <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
      <div className="mx-auto max-w-content">
        <button
          type="button"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
          onClick={handleBack}
        >
          <FiArrowLeft />
          <span>Back to Courses</span>
        </button>

        <section className="grid gap-6 rounded-[32px] border border-border bg-light-tertiary p-6 shadow-card lg:grid-cols-[1.35fr_0.9fr] lg:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
              <span className="rounded-full bg-accent/10 px-4 py-2 text-accent">
                Courses
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-dark-secondary">
                {course.category || "General"}
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-dark-secondary">
                {course.difficulty || "Beginner"}
              </span>
              {course.isLiteVersion ? (
                <span className="rounded-full bg-dark px-4 py-2 text-white">Lite</span>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-dark sm:text-5xl">
                {course.title}
              </h1>
              <p className="max-w-3xl text-lg italic leading-relaxed text-dark-secondary">
                {shortDescription}
              </p>
              <p className="max-w-4xl text-base leading-8 text-dark-secondary">
                {course.description || "Course details will be available soon."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {heroMeta.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-accent/10 p-3 text-accent">
                      <Icon />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-dark">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-md">
              <div className="relative aspect-[4/3] bg-light-secondary">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece8e4] via-[#f6f2ee] to-[#e5dfda] text-center">
                    <div className="space-y-3 px-8 text-dark-secondary">
                      <FiBookOpen className="mx-auto text-4xl text-accent" />
                      <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Course Preview
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/60 bg-white/90 px-4 py-4 shadow-md backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        {isEnrolled ? "Ready to resume" : "Enrollment"}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-dark">
                        {isFree ? "Free" : `$${priceAmount}`}
                      </p>
                      {isSubscriptionCourse ? (
                        <p className="text-sm text-dark-secondary">
                          Included with {course.subscription?.tier || "subscription"}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-accent transition hover:-translate-y-0.5 hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
                      onClick={isEnrolled ? handleContinueLearning : handleEnroll}
                      disabled={enrolling}
                    >
                      {isEnrolled
                        ? "Continue Learning"
                        : isFree
                        ? enrolling
                          ? "Enrolling..."
                          : "Enroll Free"
                        : enrolling
                        ? "Starting Checkout..."
                        : `Enroll for $${priceAmount}`}
                    </button>
                  </div>
    <div className="cd-page">
      <div className="cd-container">

        <button className="cd-back-btn" onClick={handleBack}>
          <FiArrowLeft size={16} /> Back to Courses
        </button>

        <div className="cd-hero-image">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} />
          ) : (
            <div className="cd-hero-placeholder">📚</div>
          )}
        </div>

        <div className="cd-title-row">
          <h1 className="cd-title">{course.title}</h1>
          <p className="cd-description">{course.description}</p>
          <div className="cd-meta">
            <span className="cd-meta-item"><FiClock size={14} /> {course.duration || 'N/A'}</span>
            <span className="cd-meta-item"><FiAward size={14} /> {course.category || 'General'}</span>
            <span className="cd-meta-item"><FiBarChart2 size={14} /> {course.difficulty || 'Beginner'}</span>
          </div>
        </div>

        <div className="cd-body">

          <div className="cd-main">

            <div className="cd-section">
              <div className="cd-section-header">
                <h2>Course Content</h2>
                <span className="cd-lesson-count">
                  {course.modules?.length || 0} modules • {totalLessons} lessons
                </span>
              </div>

              {course.modules?.length > 0 ? (
                course.modules.map((module, index) => {
                  const key = module._id || index;
                  const isOpen = expandedModules[key];
                  const lessonCount = module.lessons?.length || 0;

                  return (
                    <div key={key} className="cd-module">
                      <div className="cd-module-header" onClick={() => toggleModule(key)}>
                        <span className="cd-module-title">
                          Module {index + 1}: {module.title}
                          {lessonCount > 0 && (
                            <span className="cd-module-lessons"> ({lessonCount} lesson{lessonCount !== 1 ? 's' : ''})</span>
                          )}
                        </span>
                        <span className="cd-module-chevron">{isOpen ? '−' : '+'}</span>
                      </div>

                      {isOpen && (
                        <div className="cd-module-content">
                          {module.description && <p>{module.description}</p>}
                          {module.lessons?.length > 0 && (
                            <ul className="cd-lessons-list">
                              {module.lessons.map((lesson, li) => (
                                <li key={lesson._id || li} className="cd-lesson-item">
                                  <span className="cd-lesson-icon">
                                    {lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '❓' : '📝'}
                                  </span>
                                  <span className="cd-lesson-title">{lesson.title}</span>
                                  {lesson.duration && (
                                    <span className="cd-lesson-duration">{lesson.duration}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="cd-empty">No modules available yet.</p>
              )}
            </div>

            <div className="cd-section cd-reviews">
              <h2>Reviews &amp; Ratings</h2>
              <div className="cd-stars-row">
                <div className="cd-stars">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="cd-star filled">★</span>
                  ))}
                </div>
                <span className="cd-rating-text">5.0 out of 5</span>
              </div>
              <p className="cd-review-count">Based on 0 reviews</p>
              <p className="cd-no-reviews">Be the first to leave a review for this course</p>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white p-5 shadow-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-light-tertiary px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Modules
                </p>
                <p className="mt-2 text-2xl font-bold text-dark">{modules.length}</p>
              </div>
              <div className="rounded-2xl bg-light-tertiary px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Lectures
                </p>
                <p className="mt-2 text-2xl font-bold text-dark">{lectureCount}</p>
              </div>
              <div className="rounded-2xl bg-light-tertiary px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Level
                </p>
                <p className="mt-2 text-2xl font-bold text-dark">
                  {course.difficulty || "Beginner"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                <FiTrendingUp />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  What You&apos;ll Learn
                </p>
                <h2 className="text-3xl font-bold text-dark">Outcome-focused skills</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {highlights.map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-light-tertiary px-4 py-4"
                >
                  <div className="mt-0.5 rounded-full bg-accent/10 p-2 text-accent">
                    <FiCheck />
                  </div>
                  <p className="text-sm leading-7 text-dark-secondary">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                <FiLayers />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  At a Glance
                </p>
                <h2 className="text-3xl font-bold text-dark">Course overview</h2>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm leading-7 text-dark-secondary">
              <p>
                {course.description || "This course overview will be updated soon."}
              </p>
              <div className="rounded-2xl border border-border bg-light-tertiary px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Best for
                </p>
                <p className="mt-2 text-sm leading-7 text-dark-secondary">
                  {course.category
                    ? `Freelancers building stronger ${course.category.toLowerCase()} skills.`
                    : "Freelancers who want a practical system they can apply immediately."}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-light-tertiary px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Access
                </p>
                <p className="mt-2 text-sm leading-7 text-dark-secondary">
                  {isEnrolled
                    ? "You are enrolled and can continue where you left off."
                    : user
                    ? "Enroll to unlock the learning path and continue-learning flow."
                    : "Sign in and enroll to save progress and access course learning screens."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Curriculum
              </p>
              <h2 className="text-3xl font-bold text-dark">Course content</h2>
            </div>
            <p className="text-sm text-dark-secondary">
              {modules.length} sections · {lectureCount} lectures · {totalLength}
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-light-tertiary px-6 py-12 text-center text-dark-secondary">
              Course content will be available soon.
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {modules.map((moduleItem, index) => {
                const moduleKey = moduleItem._id || index;
                const embedUrl = toYouTubeEmbedUrl(moduleItem.videoUrl);
                const isExpanded = Boolean(expandedModules[moduleKey]);
                const lectureTotal = getLectureCount(moduleItem);
                const moduleLength =
                  formatMinutes(moduleItem.estimatedMinutes) ||
                  moduleItem.duration ||
                  "Self-paced";

                return (
                  <div
                    key={moduleKey}
                    className="overflow-hidden rounded-[28px] border border-border bg-light-tertiary"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-white"
                      onClick={() => toggleModule(moduleKey)}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
                        <FiPlayCircle className="text-2xl" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-dark">
                          {moduleItem.title || `Module ${index + 1}`}
                        </p>
                        <p className="mt-1 text-sm text-dark-secondary">
                          {lectureTotal} lectures · {moduleLength}
                        </p>
                      </div>

                      <FiChevronDown
                        className={`shrink-0 text-xl text-dark-secondary transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-border bg-white px-5 py-5">
                        <p className="text-sm leading-7 text-dark-secondary">
                          {moduleItem.description ||
                            "Module description will be available soon."}
                        </p>

                        {Array.isArray(moduleItem.learningPoints) && moduleItem.learningPoints.length ? (
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {moduleItem.learningPoints.map((point, pointIndex) => (
                              <div
                                key={`${moduleKey}-point-${pointIndex}`}
                                className="flex items-start gap-3 rounded-2xl border border-border bg-light-tertiary px-4 py-4"
                              >
                                <div className="mt-0.5 rounded-full bg-accent/10 p-2 text-accent">
                                  <FiCheck />
                                </div>
                                <p className="text-sm leading-7 text-dark-secondary">
                                  {point}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {embedUrl ? (
                          <div className="mt-6 space-y-4">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-secondary"
                              onClick={() => toggleVideo(moduleKey)}
                            >
                              <FiPlayCircle />
                              <span>{openVideos[moduleKey] ? "Hide preview" : "Watch preview"}</span>
                            </button>

                            {openVideos[moduleKey] ? (
                              <div className="overflow-hidden rounded-[24px] border border-border bg-[#111]">
                                <iframe
                                  src={embedUrl}
                                  title={moduleItem.title || `Module ${index + 1}`}
                                  allowFullScreen
                                  className="aspect-video w-full border-0"
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[32px] border border-border bg-dark px-6 py-6 text-white shadow-lg lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Ready to start?
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {isEnrolled ? "Jump back into your course." : "Unlock the full learning path."}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/75">
                {isEnrolled
                  ? "Your enrollment is active. Continue from the course learning experience."
                  : isFree
                  ? "Free enrollment keeps this course in your account and lets you track progress."
                  : "Checkout uses the current course purchase flow already wired on this branch."}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
              onClick={isEnrolled ? handleContinueLearning : handleEnroll}
              disabled={enrolling}
            >
              {isEnrolled
                ? "Continue Learning"
                : isFree
                ? enrolling
                  ? "Enrolling..."
                  : "Enroll Free"
                : enrolling
                ? "Starting Checkout..."
                : `Enroll for $${priceAmount}`}
            </button>
          </div>
        </section>

          </div>

          <aside className="cd-sidebar">

            <div className="cd-sidebar-card">
              <div className="cd-price">
                {course.isFree ? 'Free' : `$${course.priceAmount}`}
              </div>
              {isEnrolled ? (
                <button className="cd-cta-btn" onClick={handleContinueLearning}>
                  Continue Learning
                </button>
              ) : (
                <button className="cd-cta-btn" onClick={handleEnroll} disabled={enrolling}>
                  {course.isFree
                    ? enrolling ? 'Enrolling...' : 'Enroll Free'
                    : enrolling ? 'Starting Checkout...' : `Enroll for $${course.priceAmount}`}
                </button>
              )}
            </div>

            {course.instructor && (
              <div className="cd-sidebar-card">
                <h3 className="cd-sidebar-label">Instructor</h3>
                <div className="cd-instructor">
                  <div className="cd-instructor-avatar">
                    {course.instructor.avatar ? (
                      <img src={course.instructor.avatar} alt={course.instructor.name} />
                    ) : (
                      <div className="cd-avatar-placeholder">
                        {course.instructor.name?.charAt(0) || 'I'}
                      </div>
                    )}
                  </div>
                  <div className="cd-instructor-info">
                    <div className="cd-instructor-name">{course.instructor.name}</div>
                    {course.instructor.bio && (
                      <div className="cd-instructor-bio">{course.instructor.bio}</div>
                    )}
                    {!course.instructor.bio && course.instructor.title && (
                      <div className="cd-instructor-bio">{course.instructor.title}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {course.learningPoints?.length > 0 ? (
              <div className="cd-sidebar-card">
                <h3 className="cd-sidebar-label">What You'll Learn</h3>
                <ol className="cd-learning-list">
                  {course.learningPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ol>
              </div>
            ) : course.modules?.length > 0 && (
              <div className="cd-sidebar-card">
                <h3 className="cd-sidebar-label">What You'll Learn</h3>
                <ol className="cd-learning-list">
                  {course.modules.map((m, i) => (
                    <li key={i}>{m.title}</li>
                  ))}
                </ol>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;