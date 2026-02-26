/* global process */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiPlay,
  FiStar,
} from 'react-icons/fi';

// ------------------------------
// STRIPE IMPORTS
// ------------------------------
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ------------------------------
// CHECKOUT COMPONENT
// ------------------------------
import CheckoutForm from "../../../components/Shared/CheckoutForm";

// ------------------------------
// STRIPE INITIALIZATION
// ------------------------------
// Must be outside component to avoid re-creating Stripe on every render
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

console.log(
  "Stripe publishable key:",
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ------------------------------
  // STATE
  // ------------------------------
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [openVideos, setOpenVideos] = useState({});

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const next = { ...prev, [moduleId]: !prev[moduleId] };

      // If closing module, also close its video dropdown
      if (prev[moduleId]) {
        setOpenVideos(v => ({ ...v, [moduleId]: false }));
      }

      return next;
    });
  };

  const toggleVideo = (moduleKey) => {
    setOpenVideos(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const toYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    try {
      const u = new URL(url);

      // Already an embed link
      if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
        return url;
      }

      // youtu.be/<id>
      if (u.hostname === "youtu.be") {
        const id = u.pathname.replace("/", "");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      // youtube.com/watch?v=<id>
      const v = u.searchParams.get("v");
      if (v) {
        const list = u.searchParams.get("list");
        return list
          ? `https://www.youtube.com/embed/${v}?list=${encodeURIComponent(list)}`
          : `https://www.youtube.com/embed/${v}`;
      }

      return "";
    } catch {
      return "";
    }
  };

  // Stripe-related state
  const [clientSecret, setClientSecret] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  // ------------------------------
  // FETCH COURSE DATA
  // ------------------------------
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);

        const response = await fetch(`http://localhost:5000/api/academy/courses/${id}`);

        if (!response.ok) {
          throw new Error('Course not found');
        }

        const data = await response.json();
        setCourse(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  // ------------------------------
  // NAVIGATION
  // ------------------------------
  const handleBack = () => {
    navigate('/academy/courses');
  };

  // ------------------------------
  // START ENROLLMENT / PAYMENT FLOW
  // ------------------------------
  const handleEnroll = async () => {
    if (!course) {
      console.warn("handleEnroll called with no course");
      return;
    }

    try {
      setEnrolling(true);

      const res = await fetch(
        "http://localhost:5000/api/payments/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course._id,
            userId: "TEMP_USER_ID", // replace with real auth user later
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment initialization failed");
      }

      // ------------------------------
      // FREE COURSE FLOW
      // ------------------------------
      if (data.free) {
        navigate(`/academy/courses/${course._id}/learn`);
        return;
      }

      // ------------------------------
      // PAID COURSE FLOW
      // ------------------------------
      if (!data.clientSecret) {
        throw new Error("Missing clientSecret from backend");
      }

      setClientSecret(data.clientSecret);

    } catch (err) {
      console.error("Enrollment failed:", err);
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  // ------------------------------
  // HELPERS
  // ------------------------------
  const getShortDescription = (value) => {
    const text = String(value || '').trim();
    if (!text) return 'Build your freelance career with practical, real-world guidance.';
    const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
    return firstSentence.length > 140 ? `${firstSentence.slice(0, 137).trimEnd()}...` : firstSentence;
  };

  const formatDate = (value) => {
    if (!value) return '00/0000';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return '00/0000';
    }
  };

  const formatMinutes = (value) => {
    const minutes = Number(value || 0);
    if (!Number.isFinite(minutes) || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${String(mins).padStart(2, '0')}m`;
  };

  const getTotalLectureCount = (modules = []) => (
    modules.reduce((total, moduleItem) => total + (moduleItem?.learningPoints?.length || 0), 0)
  );

  const handleModuleKeyDown = (event, moduleKey) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleModule(moduleKey);
    }
  };

  // ------------------------------
  // LOADING STATE
  // ------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-light-primary pt-8 px-10 max-sm:px-4 max-sm:pt-5">
        <div className="max-w-content mx-auto">
          <div className="text-center py-16 px-5 text-dark-secondary">Loading course...</div>
        </div>
      </div>
    );
  }

  // ------------------------------
  // ERROR STATE
  // ------------------------------
  if (error || !course) {
    return (
      <div className="min-h-screen bg-light-primary pt-8 px-10 max-sm:px-4 max-sm:pt-5">
        <div className="max-w-content mx-auto">
          <button className="bg-transparent border-none text-dark-primary text-base cursor-pointer mb-8 py-2 inline-flex items-center transition-colors duration-300 hover:text-dark-secondary" onClick={handleBack}>
            <FiArrowLeft className="inline mr-1" /> Back to Courses
          </button>
          <div className="text-center py-16 px-5 text-dark-secondary">
            <h2 className="text-dark-primary mb-2.5">Course Not Found</h2>
            <p>{error || 'The course you are looking for does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------
  // MAIN RENDER
  // ------------------------------
  const modules = Array.isArray(course?.modules) ? course.modules : [];
  const totalLectures = getTotalLectureCount(modules);
  const totalLength = formatMinutes(course?.estimatedMinutes) || course?.duration || '00h 00m';
  const priceAmount = Number(course?.priceAmount ?? course?.pricing?.amount ?? 0);
  const isFree = Boolean(course?.isFree) || course?.isLiteVersion || priceAmount === 0;
  const hasSubscription = course?.subscription?.isSubscriptionCourse === true || course?.subscription?.isSubscriptionCourse === 'true';
  const tierLabel = course?.subscription?.tier || 'Standard';
  const shortDescription = getShortDescription(course?.description);

  return (
    <div className="min-h-screen bg-main-bg pt-10 pb-16 px-6 font-academy">
      <div className="max-w-content mx-auto">
        <button
          className="bg-transparent border-none text-dark text-base cursor-pointer mb-6 py-2 inline-flex items-center transition-colors duration-300 hover:text-dark-secondary"
          onClick={handleBack}
        >
          <FiArrowLeft className="inline mr-1" /> Back to Courses
        </button>

        {/* HERO */}
        <section className="bg-light-tertiary border border-border rounded-2xl p-8 md:p-10 shadow-card grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-accent uppercase tracking-[0.15em]">
              Courses &gt; {course.category || 'General'}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-dark leading-tight">{course.title}</h1>
            <p className="text-lg text-dark-secondary italic">{shortDescription}</p>
            <div className="text-sm text-dark-secondary space-y-2">
              <p>Instructor: {course?.instructor?.name || 'UniFreelancer Academy'}</p>
              <p>Last updated: {formatDate(course?.updatedAt || course?.createdAt)}</p>
              <p>Language/Subtitles: English</p>
            </div>
          </div>
          <div className="w-full h-[240px] md:h-[280px] rounded-xl overflow-hidden bg-light-secondary">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-muted bg-gradient-to-br from-[#e8e8e8] to-[#f3f3f3]">
                Course Image
              </div>
            )}
          </div>
        </section>

        {/* INFO BAR */}
        <section className="mt-6 bg-white border border-border rounded-lg shadow-sm flex flex-wrap items-stretch w-fit max-w-full mx-auto">
          <div className="flex flex-col justify-center px-5 py-4 min-w-[160px] border-b border-border md:border-b-0 md:border-r border-border">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Tier Level</span>
            <span className="text-base font-semibold text-accent">{tierLabel}</span>
          </div>
          <div className="flex flex-col justify-center px-5 py-4 min-w-[180px] border-b border-border md:border-b-0 md:border-r border-border">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Level</span>
            <span className="text-base font-semibold text-dark">{course.difficulty || 'Beginner'}</span>
            <span className="text-xs text-muted">Recommended Experience</span>
          </div>
          <div className="flex flex-col justify-center px-5 py-4 min-w-[180px] border-b border-border md:border-b-0 md:border-r border-border">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Ratings</span>
            <div className="flex items-center gap-1 text-muted">
              <FiStar />
              <FiStar />
              <FiStar />
              <FiStar />
              <FiStar />
            </div>
            <span className="text-xs text-muted">No ratings yet</span>
          </div>
          {(isFree || hasSubscription) && (
            <div className="flex items-center gap-3 px-5 py-4 min-w-[220px] border-b border-border md:border-b-0 md:border-r border-border">
              <div className="flex flex-col">
                <button
                  className="bg-accent text-white px-5 py-3 rounded-md font-semibold text-sm shadow-accent hover:bg-accent-secondary transition-colors"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Starting Checkout...' : 'Enroll for Free'}
                </button>
                <span className="text-[11px] text-muted mt-1">
                  Included with {tierLabel} subscription
                </span>
              </div>
            </div>
          )}
          {!isFree && (
            <div className="flex items-center px-5 py-4 min-w-[200px]">
              <button
                className="bg-dark text-white px-5 py-3 rounded-md font-semibold text-sm shadow-md hover:bg-dark-secondary transition-colors"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Starting Checkout...' : `Buy Now $${priceAmount}`}
              </button>
            </div>
          )}
        </section>

        {/* LEARNING + OVERVIEW */}
        <section className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-dark mb-4">What you&apos;ll learn</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(course.learningPoints?.length ? course.learningPoints : [
                  'Build a signature freelance brand clients trust.',
                  'Define your unique positioning and messaging.',
                  'Create content that drives inbound leads.',
                  'Develop a repeatable client acquisition system.',
                  'Strengthen your portfolio and proposal strategy.',
                  'Deliver work that turns into referrals.',
                ]).map((point, index) => (
                  <div key={`${point}-${index}`} className="flex items-start gap-2 text-dark-secondary">
                    <FiCheck className="mt-1 text-accent" />
                    <span className="text-base leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-dark mb-4">Overview</h2>
              <p className="text-base leading-[1.8] text-dark-secondary">
                {course.description || 'No description available for this course yet.'}
              </p>
            </div>
          </div>

          <div className="bg-light-tertiary border border-border rounded-xl p-5 shadow-card">
            <div className="relative w-full h-[220px] sm:h-[260px] rounded-lg overflow-hidden bg-light-secondary">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={`${course.title} preview`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  Preview Video
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 border border-border flex items-center justify-center shadow-md">
                  <FiPlay className="text-dark text-2xl ml-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COURSE CONTENT */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-dark mb-2">Course Content</h2>
          <p className="text-sm text-muted mb-6">
            {`${modules.length} sections | ${totalLectures} lectures | ${totalLength} total length`}
          </p>

          <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            {modules.length === 0 ? (
              <div className="p-6 text-muted">Course content will be available soon.</div>
            ) : (
              modules.map((moduleItem, index) => {
                const moduleKey = moduleItem._id || index;
                const embedUrl = toYouTubeEmbedUrl(moduleItem.videoUrl);
                const moduleLectures = moduleItem?.learningPoints?.length || 0;
                const moduleLength = formatMinutes(moduleItem?.estimatedMinutes) || moduleItem?.duration || 'Length';

                return (
                  <div key={moduleKey} className="border-b border-border last:border-b-0">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleModule(moduleKey)}
                      onKeyDown={(event) => handleModuleKeyDown(event, moduleKey)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-light-secondary/40 transition-colors cursor-pointer"
                    >
                      <div className="w-[72px] h-[56px] rounded-md bg-light-secondary overflow-hidden flex items-center justify-center text-xs text-muted">
                        {moduleItem.thumbnail ? (
                          <img src={moduleItem.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          'Module'
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-dark">{moduleItem.title || `Module ${index + 1}`}</p>
                        <p className="text-xs text-muted">{`${moduleLectures} lectures | ${moduleLength}`}</p>
                      </div>
                      <FiChevronDown
                        className={`text-dark-secondary transition-transform ${expandedModules[moduleKey] ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {expandedModules[moduleKey] && (
                      <div className="px-6 pb-5 text-dark-secondary space-y-4">
                        <p className="text-base leading-relaxed">
                          {moduleItem.description || 'Module description will be available soon.'}
                        </p>

                        {embedUrl && (
                          <div className="space-y-3">
                            <button
                              onClick={() => toggleVideo(moduleKey)}
                              className="py-2 px-4 bg-accent text-white border-none rounded-sm text-sm font-semibold cursor-pointer transition-colors duration-300 hover:bg-accent-secondary"
                            >
                              Watch Video
                            </button>

                            {openVideos[moduleKey] && (
                              <iframe
                                src={embedUrl}
                                title={moduleItem.title}
                                allowFullScreen
                                className="w-full aspect-video rounded-md border-0"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ENROLLMENT */}
        <section className="mt-10">
          {!clientSecret ? (
            <button
              className="bg-dark text-white border-none py-4 px-12 text-lg font-semibold rounded-md cursor-pointer transition-all duration-300 hover:bg-dark-secondary hover:-translate-y-0.5 active:translate-y-0"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {isFree ? 'Enroll for Free' : enrolling ? 'Starting Checkout...' : `Enroll for $${priceAmount}`}
            </button>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          )}
        </section>
      </div>
    </div>
  );
}

export default CourseDetail;
