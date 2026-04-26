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
import "./CourseDetail.css";
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
  if (Array.isArray(moduleItem?.lessons)) return moduleItem.lessons.length;
  if (Array.isArray(moduleItem?.learningPoints)) return moduleItem.learningPoints.length;
  return moduleItem?.videoUrl ? 1 : 0;
};

const toYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com") && parsedUrl.pathname.startsWith("/embed/")) {
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

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [openVideos, setOpenVideos] = useState({});
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

  const toggleVideo = (moduleId) => {
    setOpenVideos((prev) => ({
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
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        Loading course...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Course Not Found</h2>
          <button onClick={handleBack} className="mt-4 underline">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const highlights = (course.learningPoints?.length
    ? course.learningPoints
    : fallbackLearningPoints
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-main-bg px-6 py-8 font-academy">
      <button onClick={handleBack} className="mb-6 flex items-center gap-2">
        <FiArrowLeft /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="mt-2 text-dark-secondary">{course.description}</p>

          <div className="mt-4 flex gap-4 text-sm">
            <span><FiUser /> {course.instructor?.name}</span>
            <span><FiCalendar /> {formatDate(course.updatedAt)}</span>
            <span><FiClock /> {totalMinutes}</span>
          </div>

          <button
            onClick={isEnrolled ? handleContinueLearning : handleEnroll}
            disabled={enrolling}
            className="mt-6 bg-accent text-white px-6 py-3 rounded-full"
          >
            {isEnrolled
              ? "Continue Learning"
              : enrolling
              ? "Processing..."
              : "Enroll"}
          </button>

          <div className="mt-8">
            <h3 className="font-semibold">What You’ll Learn</h3>
            <ul className="mt-3 space-y-2">
              {highlights.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <FiCheck /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-4">Modules</h3>

            {modules.map((m, i) => {
              const key = m._id || i;
              const open = expandedModules[key];

              return (
                <div key={key} className="border-b py-2">
                  <button
                    onClick={() => toggleModule(key)}
                    className="flex justify-between w-full"
                  >
                    <span>{m.title}</span>
                    <FiChevronDown className={open ? "rotate-180" : ""} />
                  </button>

                  {open && (
                    <div className="mt-2 text-sm text-dark-secondary">
                      {m.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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