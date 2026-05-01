import React, { useEffect, useState, useMemo } from "react";
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
import AlertModal from '../../../components/UI/AlertModal';

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
  return remainder ? `${hours}h ${String(remainder).padStart(2, "0")}m` : `${hours}h`;
};

const getLectureCount = (moduleItem) => {
  let count = 0;
  if (moduleItem?.learningMaterials) {
    count += (moduleItem.learningMaterials.readings?.length || 0);
    count += (moduleItem.learningMaterials.podcasts?.length || 0);
    count += (moduleItem.learningMaterials.videos?.length || 0);
  }
  count += (Array.isArray(moduleItem?.lessons) ? moduleItem.lessons.length : 0);
  
  if (count === 0 && Array.isArray(moduleItem?.learningPoints)) {
    count += moduleItem.learningPoints.length;
  }
  if (count === 0 && moduleItem?.videoUrl) {
    count = 1;
  }
  return count;
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/academy/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourse(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  useEffect(() => {
    setIsEnrolled(includesId(user?.enrolledCourses, course?._id));
  }, [user, course]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleBack = () => navigate("/academy/courses");

  const handleContinueLearning = () => {
    navigate(`/academy/courses/${id}/learn`);
  };

  const handleEnroll = async () => {
    if (!course) return;

    if (!user) {
      navigate(`/login?returnTo=/academy/courses/${id}`);
      return;
    }

    try {
      setEnrolling(true);

      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId: course._id })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Payment failed");

      if (data.free) {
        setIsEnrolled(true);
        const refreshed = await fetch("/api/users/me", { credentials: "include" });
        if (refreshed.ok) setUser(await refreshed.json());
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Invalid server response");
    } catch (err) {
      console.error(err);
      showAlert('Error', err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const modules = Array.isArray(course?.modules) ? course.modules : [];

  const lectureCount = useMemo(
    () => modules.reduce((t, m) => t + getLectureCount(m), 0),
    [modules]
  );

  const totalMinutes = formatMinutes(course?.estimatedMinutes) || course?.duration || "Self-paced";

  if (loading) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content rounded-[32px] border border-border bg-white px-6 py-16 text-center text-dark-secondary shadow-card">
          Loading course details...
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
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
          >
            <FiArrowLeft />
            <span>Back to Courses</span>
          </button>

          <div className="rounded-[32px] border border-border bg-white px-6 py-16 text-center shadow-card">
            <h1 className="text-3xl font-bold text-dark">Unable to load course</h1>
            <p className="mx-auto mt-4 max-w-2xl text-dark-secondary">{error || "Course not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const highlights = (course.learningPoints?.length
    ? course.learningPoints
    : fallbackLearningPoints
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
      <div className="mx-auto max-w-content">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
        >
          <FiArrowLeft />
          <span>Back to Courses</span>
        </button>

        <section className="grid gap-8 rounded-[32px] border border-border bg-light-tertiary p-6 shadow-card lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
              <span className="rounded-full bg-white px-4 py-2 text-dark-secondary">
                Course
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-dark sm:text-5xl">
                {course.title}
              </h1>
              <p className="max-w-4xl text-lg leading-relaxed text-dark-secondary">
                {course.description || "Course details will be available soon."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <FiUser />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Instructor
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {course.instructor?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Last Updated
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {formatDate(course.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <FiClock />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Duration
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {totalMinutes}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                About this course
              </p>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                {course.description || "No detailed description available yet."}
              </p>
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
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece8e4] via-[#f6f2ee] to-[#e5dfda]">
                    <div className="space-y-3 text-center text-dark-secondary">
                      <FiPlayCircle className="mx-auto text-4xl text-accent" />
                      <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Course Preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-dark bg-dark px-5 py-5 text-white shadow-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Enrollment
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {isEnrolled ? "You are enrolled" : "Start learning today"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/75">
                {isEnrolled
                  ? "Pick up where you left off and continue your learning journey."
                  : "Join the course to get full access to all materials and lessons."}
              </p>

              <button
                type="button"
                onClick={isEnrolled ? handleContinueLearning : handleEnroll}
                disabled={enrolling}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isEnrolled ? (
                  <>
                    <FiPlayCircle />
                    <span>Continue Learning</span>
                  </>
                ) : enrolling ? (
                  "Processing..."
                ) : (
                  <>
                    <FiBookOpen />
                    <span>Enroll Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Instructor
          </p>
          <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row">
            {course.instructor?.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor?.name || "Instructor"}
                className="h-24 w-24 rounded-[20px] object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[20px] bg-light-tertiary text-3xl font-bold text-dark">
                {(course.instructor?.name || "I").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-dark">
                {course.instructor?.name || "Unknown Instructor"}
              </h2>
              {course.instructor?.title && (
                <p className="mt-1 text-sm font-semibold text-accent uppercase tracking-[0.1em]">
                  {course.instructor.title}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-dark-secondary max-w-3xl">
                {course.instructor?.bio || "Instructor bio will be available soon. They bring a wealth of experience and practical knowledge to this course."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Curriculum
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Course Modules</h2>
              </div>
              <div className="text-sm font-semibold text-dark-secondary">
                {modules.length} Modules • {lectureCount} Lectures
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {modules.length === 0 ? (
                <p className="text-sm text-dark-secondary">No modules available yet.</p>
              ) : (
                modules.map((m, i) => {
                  const key = m._id || i;
                  const open = expandedModules[key];
                  const lessonCount = getLectureCount(m);

                  return (
                    <div
                      key={key}
                      className={`overflow-hidden rounded-2xl border border-border transition-colors ${open ? "bg-white" : "bg-light-tertiary hover:bg-white"
                        }`}
                    >
                      <button
                        onClick={() => toggleModule(key)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${open ? "bg-accent text-white" : "bg-white text-dark shadow-sm"
                              }`}
                          >
                            <FiLayers className={open ? "text-white" : "text-dark"} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-dark">{m.title}</h3>
                            <p className="text-xs text-dark-secondary">
                              {lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform ${open ? "rotate-180 bg-light-secondary" : "bg-white shadow-sm"
                            }`}
                        >
                          <FiChevronDown />
                        </div>
                      </button>

                      {open && (
                        <div className="border-t border-border px-5 pb-5 pt-3">
                          <p className="text-sm leading-7 text-dark-secondary">
                            {m.description || "No description provided for this module."}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              What to expect
            </p>
            <h2 className="mt-2 text-2xl font-bold text-dark">What You'll Learn</h2>

            <div className="mt-8 space-y-4">
              {highlights.map((highlight, index) => (
                <div
                  key={`${highlight}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-light-tertiary px-4 py-4"
                >
                  <div className="mt-0.5 rounded-full bg-accent/10 p-2 text-accent">
                    <FiCheck />
                  </div>
                  <p className="text-sm leading-7 text-dark-secondary">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AlertModal
          isOpen={alertConfig.isOpen}
          onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
        />
      </div>
    </div>
  );
}