import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiVideo, FiLink } from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

const getEmbedUrl = (url) => {
  if (!url) return null;

  const youtubeMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]+)/i
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
};

const normalizeResources = (resources = []) => {
  if (!Array.isArray(resources)) return [];
  return resources
    .map((resource, index) => {
      if (!resource) return null;
      if (typeof resource === "string") {
        const trimmed = resource.trim();
        if (!trimmed) return null;
        return { label: `Resource ${index + 1}`, url: trimmed };
      }

      const label = resource.label || resource.name || `Resource ${index + 1}`;
      const url = resource.url || resource.link || "";
      if (!url) return null;

      return { label, url };
    })
    .filter(Boolean);
};

const formatWrittenContent = (content) => {
  if (typeof content !== "string") return [];
  return content
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
};

function TutorialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const modalTimerRef = useRef(null);
  const intentHandledRef = useRef(false);

  useEffect(() => {
    const fetchTutorial = async () => {
      if (!id) {
        setError("Missing tutorial id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/academy/tutorials/${id}`);

        if (!response.ok) {
          throw new Error("Tutorial not found");
        }

        const data = await response.json();
        setTutorial(data);
      } catch (err) {
        console.error("Error fetching tutorial:", err);
        setError(err.message || "Unable to load tutorial");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [id]);

  useEffect(() => {
    const fetchProfileForStatus = async () => {
      try {
        setAuthChecked(false);
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/users/profile`, {
          credentials: "include",
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          setIsBookmarked(false);
          setIsCompleted(false);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(true);

        const includesId = (collection, targetId) => {
          if (!Array.isArray(collection) || !targetId) return false;
          return collection.some((item) => {
            if (!item) return false;
            if (typeof item === "string") return item === targetId;
            return item._id === targetId;
          });
        };

        setIsBookmarked(includesId(data.bookmarkedTutorials, id));
        setIsCompleted(includesId(data.completedTutorials, id));
      } catch {
        setIsAuthenticated(false);
        setIsBookmarked(false);
        setIsCompleted(false);
      } finally {
        setAuthChecked(true);
      }
    };

    if (id) {
      fetchProfileForStatus();
    }
  }, [id]);

  const handleBack = () => {
    navigate("/academy/tutorials");
  };

  const closeModal = () => {
    setModal({ open: false, title: "", message: "" });
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }
  };

  const openModal = (title, message) => {
    setModal({ open: true, title, message });
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    modalTimerRef.current = setTimeout(() => {
      closeModal();
    }, 1600);
  };

  const goToLoginForIntent = (intent) => {
    const returnTo = `/academy/tutorials/${id}?intent=${encodeURIComponent(intent)}`;
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const clearIntentFromUrl = () => {
    const params = new URLSearchParams(location.search);
    params.delete("intent");
    const next = params.toString();
    navigate(`${location.pathname}${next ? `?${next}` : ""}`, { replace: true });
  };

  const setBookmark = async (next) => {
    if (!id) return;

    try {
      setIsSaving(true);
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/users/tutorials/${id}/bookmark`, {
        method: next ? "POST" : "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        goToLoginForIntent("bookmark");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to update bookmark");
      }

      setIsBookmarked(next);
      setIsAuthenticated(true);
      openModal(next ? "Saved" : "Removed", next ? "Tutorial bookmarked." : "Bookmark removed.");
    } catch (err) {
      console.error(err);
      openModal("Error", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const setCompleted = async (next) => {
    if (!id) return;

    try {
      setIsSaving(true);
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/users/tutorials/${id}/complete`, {
        method: next ? "POST" : "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        goToLoginForIntent("complete");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to update completion");
      }

      setIsCompleted(next);
      setIsAuthenticated(true);
      openModal(
        next ? "Completed" : "Updated",
        next ? "Marked as completed." : "Completion removed."
      );
    } catch (err) {
      console.error(err);
      openModal("Error", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (intentHandledRef.current) return;
      if (!authChecked) return;

      const intent = new URLSearchParams(location.search).get("intent");
      if (!intent) {
        intentHandledRef.current = true;
        return;
      }

      if (!isAuthenticated) return;

      if (intent === "bookmark") {
        if (!isBookmarked) await setBookmark(true);
        clearIntentFromUrl();
        intentHandledRef.current = true;
        return;
      }

      if (intent === "complete") {
        if (!isCompleted) await setCompleted(true);
        clearIntentFromUrl();
        intentHandledRef.current = true;
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAuthenticated, isBookmarked, isCompleted, location.search]);

  const thumbnail = tutorial?.thumbnail || tutorial?.thumbnailUrl;
  const resources = normalizeResources(tutorial?.resources);
  const paragraphs = formatWrittenContent(tutorial?.writtenContent);
  const embedUrl = getEmbedUrl(tutorial?.videoUrl);
  const category = tutorial?.category || tutorial?.topic || "General";
  const hasVideo = Boolean(tutorial?.videoUrl);
  const hasArticle = paragraphs.length > 0;
  const publishedDate = tutorial?.createdAt
    ? new Date(tutorial.createdAt).toLocaleDateString()
    : null;

  return (
    <div className="min-h-screen bg-main-bg pt-[100px] px-[40px] max-sm:px-[15px] max-sm:pt-5">
      <div className="max-w-content mx-auto">
        <button className="bg-transparent border-none text-dark text-base cursor-pointer mb-8 py-2 inline-flex items-center transition-colors hover:text-dark-secondary" onClick={handleBack}>
          <FiArrowLeft size={18} /> Back to Tutorials
        </button>

        {loading ? (
          <div className="text-center py-[60px] px-5 text-dark-secondary">Loading tutorial...</div>
        ) : error || !tutorial ? (
          <div className="mb-12 bg-light-tertiary rounded-lg p-10 shadow-card text-left max-md:p-[30px_25px]">
            <h2 className="text-3xl font-bold text-dark mb-6 pb-4 border-b-2 border-border">Unable to load this tutorial</h2>
            <p className="text-md text-dark-secondary">{error || "Please try again."}</p>
          </div>
        ) : (
          <>
            <div className="relative grid grid-cols-[1fr_1.5fr] gap-10 bg-light-tertiary rounded-lg p-10 shadow-card mb-12 max-md:grid-cols-1 max-md:gap-[30px] max-sm:p-[25px_20px]">
              <button
                type="button"
                className={`absolute top-[22px] right-[22px] w-11 h-11 rounded-md border inline-flex items-center justify-center cursor-pointer z-[2] transition-all duration-fast max-md:top-4 max-md:right-4 ${
                  isBookmarked
                    ? "border-[rgba(123,31,162,0.35)] bg-[rgba(255,255,255,0.9)] [&>svg]:text-[#7b1fa2]"
                    : "border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.9)] [&>svg]:text-dark"
                } hover:-translate-y-px hover:border-[rgba(0,0,0,0.14)] hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
                onClick={() => setBookmark(!isBookmarked)}
                disabled={isSaving}
                title={
                  isAuthenticated
                    ? isBookmarked
                      ? "Remove bookmark"
                      : "Save to profile"
                    : "Sign in to bookmark"
                }
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark tutorial"}
              >
                {isBookmarked ? <BsBookmarkFill /> : <BsBookmark />}
              </button>

              <div className="w-full h-[300px] rounded-md overflow-hidden bg-[#f5f5f5] max-sm:h-[250px]">
                {thumbnail ? (
                  <img src={thumbnail} alt={tutorial.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[100px] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">📘</div>
                )}
              </div>

              <div className="flex flex-col justify-start">
                <div className="flex gap-3 mb-5 flex-wrap">
                  <span className="py-[6px] px-[14px] rounded-full text-sm font-semibold bg-[#f3e5f5] text-[#7b1fa2]">{category}</span>
                  {hasVideo && (
                    <span className="py-[6px] px-[14px] rounded-full text-sm font-semibold bg-[#e3f2fd] text-[#1976d2]">Video</span>
                  )}
                  {hasArticle && (
                    <span className="py-[6px] px-[14px] rounded-full text-sm font-semibold bg-[#e8f5e9] text-[#2e7d32]">Article</span>
                  )}
                </div>

                <h1 className="text-5xl font-bold text-dark mb-4 leading-[1.2] max-md:text-3xl">{tutorial.title}</h1>
                <p className="text-base text-dark-secondary leading-[1.8]">{tutorial.description}</p>

                <div className="mt-auto">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 mt-6">
                    <div className="bg-white border border-border rounded-md p-4 flex gap-3 items-center">
                      <FiClock className="text-xl text-accent" />
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-dark-tertiary">Duration</span>
                        <span className="text-base font-semibold text-dark-secondary">
                          {tutorial.duration || "Self-paced"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {publishedDate && (
                    <p className="mt-[30px] text-sm text-dark-tertiary text-right">Published {publishedDate}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-12 bg-light-tertiary rounded-lg p-10 shadow-card max-md:p-[30px_25px]">
              <h2 className="text-3xl font-bold text-dark mb-6 pb-4 border-b-2 border-border max-sm:text-[22px]">Overview</h2>
              <div>
                <p className="m-0 text-base text-dark-secondary leading-[1.8]">{tutorial.description}</p>
              </div>
            </div>

            {tutorial.videoUrl && (
              <div className="mb-12 bg-light-tertiary rounded-lg p-10 shadow-card max-md:p-[30px_25px]">
                <h2 className="text-3xl font-bold text-dark mb-6 pb-4 border-b-2 border-border max-sm:text-[22px]">Watch the Tutorial</h2>
                <div className="relative pb-[56.25%] h-0 border border-border rounded-[14px] overflow-hidden bg-[#111]">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={tutorial.title}
                      className="absolute top-0 left-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex flex-col items-start gap-3 p-[30px] bg-light-tertiary text-dark-secondary">
                      <FiVideo className="text-[26px] text-accent" />
                      <p>
                        We couldn't embed this video, but you can watch it in a new
                        tab.
                      </p>
                      <a
                        className="py-[10px] px-[18px] bg-accent rounded-sm text-white no-underline text-base font-semibold transition-colors hover:bg-accent-tertiary"
                        href={tutorial.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Video
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paragraphs.length > 0 && (
              <div className="mb-12 bg-light-tertiary rounded-lg p-10 shadow-card max-md:p-[30px_25px]">
                <h2 className="text-3xl font-bold text-dark mb-6 pb-4 border-b-2 border-border max-sm:text-[22px]">Written Guide</h2>
                <div className="flex flex-col gap-[14px] text-base leading-[1.8] text-dark-secondary [&>p]:m-0">
                  {paragraphs.map((paragraph, index) => (
                    <p key={`paragraph-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-12 bg-light-tertiary rounded-lg p-10 shadow-card max-md:p-[30px_25px]">
              <h2 className="text-3xl font-bold text-dark mb-6 pb-4 border-b-2 border-border max-sm:text-[22px]">Resources</h2>
              {resources.length > 0 ? (
                <ul className="list-none flex flex-col gap-3 p-0 m-0">
                  {resources.map((resource, index) => (
                    <li
                      key={`${resource.label}-${index}`}
                      className="border border-border rounded-md py-[14px] px-4 flex justify-between items-center gap-4 bg-white"
                    >
                      <div className="flex items-center gap-[10px] text-base text-dark [&>svg]:text-accent">
                        <FiLink />
                        <span>{resource.label}</span>
                      </div>
                      <a
                        className="py-[10px] px-[18px] bg-accent rounded-sm text-white no-underline text-base font-semibold transition-colors hover:bg-accent-tertiary"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-dark-secondary text-base">
                  No downloadable resources have been added yet.
                </p>
              )}
            </div>

            <div className="mt-12 pt-8 border-t-2 border-border flex justify-center">
              <button
                type="button"
                className={`border-none py-4 px-12 text-lg font-semibold rounded cursor-pointer transition-all duration-300 hover:-translate-y-[2px] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
                  isCompleted
                    ? "bg-[#2e7d32] text-white hover:bg-[#1f5d24]"
                    : "bg-dark text-white hover:bg-dark-secondary"
                }`}
                onClick={() => setCompleted(!isCompleted)}
                disabled={isSaving}
                title={
                  isAuthenticated
                    ? isCompleted
                      ? "Mark as not completed"
                      : "Mark as completed"
                    : "Sign in to track completion"
                }
              >
                {isCompleted ? "Completed" : "Mark as Completed"}
              </button>
            </div>

            {modal.open && (
              <div
                className="fixed inset-0 bg-[rgba(0,0,0,0.35)] flex items-center justify-center p-5 z-[1000]"
                role="dialog"
                aria-modal="true"
                onClick={closeModal}
              >
                <div
                  className="w-full max-w-[420px] bg-white rounded-lg p-[22px] shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="m-0 mb-2 text-lg text-dark">{modal.title}</h3>
                  <p className="m-0 mb-[18px] text-dark-secondary leading-normal">{modal.message}</p>
                  <button
                    type="button"
                    className="w-full border border-[rgba(0,0,0,0.12)] bg-white rounded-[10px] py-[10px] px-[14px] cursor-pointer font-semibold text-dark hover:bg-[rgba(0,0,0,0.04)]"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TutorialDetail;
