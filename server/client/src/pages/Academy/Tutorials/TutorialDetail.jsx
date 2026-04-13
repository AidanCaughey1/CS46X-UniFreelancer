import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiFileText,
  FiLink,
  FiVideo
} from "react-icons/fi";
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

const formatDuration = (duration) => {
  if (!duration) return "Self-paced";
  const normalized = String(duration).trim();
  return /^\d+$/.test(normalized) ? `${normalized} minutes` : normalized;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
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
        const response = await fetch(`/api/academy/tutorials/${id}`);

        if (!response.ok) {
          throw new Error("Tutorial not found");
        }

        const data = await response.json();
        setTutorial(data);
      } catch (fetchError) {
        console.error("Error fetching tutorial:", fetchError);
        setError(fetchError.message || "Unable to load tutorial");
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
        const response = await fetch("/api/users/profile", {
          credentials: "include"
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsBookmarked(false);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(true);
        setIsAdmin(data.accountType === "admin");

        const includesId = (collection, targetId) => {
          if (!Array.isArray(collection) || !targetId) return false;
          return collection.some((item) => {
            if (!item) return false;
            if (typeof item === "string") return item === targetId;
            return item._id === targetId;
          });
        };

        setIsBookmarked(includesId(data.bookmarkedTutorials, id));
      } catch {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsBookmarked(false);
      } finally {
        setAuthChecked(true);
      }
    };

    if (id) {
      fetchProfileForStatus();
    }
  }, [id]);

  const closeModal = useCallback(() => {
    setModal({ open: false, title: "", message: "" });

    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }
  }, []);

  const openModal = useCallback((title, message) => {
    setModal({ open: true, title, message });

    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }

    modalTimerRef.current = setTimeout(() => {
      closeModal();
    }, 1600);
  }, [closeModal]);

  const goToLoginForIntent = useCallback((intent) => {
    const returnTo = `/academy/tutorials/${id}?intent=${encodeURIComponent(intent)}`;
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [id, navigate]);

  const clearIntentFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.delete("intent");
    const next = params.toString();
    navigate(`${location.pathname}${next ? `?${next}` : ""}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const setBookmark = useCallback(async (nextValue) => {
    if (!id) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/users/tutorials/${id}/bookmark`, {
        method: nextValue ? "POST" : "DELETE",
        credentials: "include"
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        goToLoginForIntent("bookmark");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to update bookmark");
      }

      setIsBookmarked(nextValue);
      setIsAuthenticated(true);
      openModal(
        nextValue ? "Saved" : "Removed",
        nextValue ? "Tutorial bookmarked." : "Bookmark removed."
      );
    } catch (bookmarkError) {
      console.error(bookmarkError);
      openModal("Error", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [goToLoginForIntent, id, openModal]);

  useEffect(() => {
    const run = async () => {
      if (intentHandledRef.current || !authChecked) return;

      const intent = new URLSearchParams(location.search).get("intent");
      if (!intent) {
        intentHandledRef.current = true;
        return;
      }

      if (!isAuthenticated) return;

      if (intent === "bookmark") {
        if (!isBookmarked) {
          await setBookmark(true);
        }

        clearIntentFromUrl();
        intentHandledRef.current = true;
      }
    };

    run();
  }, [authChecked, clearIntentFromUrl, isAuthenticated, isBookmarked, location.search, setBookmark]);

  useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    navigate("/academy/tutorials");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content rounded-[32px] border border-border bg-white px-6 py-16 text-center text-dark-secondary shadow-card">
          Loading tutorial...
        </div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <button
            type="button"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
            onClick={handleBack}
          >
            <FiArrowLeft />
            <span>Back to Tutorials</span>
          </button>

          <div className="rounded-[32px] border border-border bg-white px-6 py-16 text-center shadow-card">
            <h1 className="text-3xl font-bold text-dark">Unable to load this tutorial</h1>
            <p className="mx-auto mt-4 max-w-2xl text-dark-secondary">
              {error || "Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const thumbnail = tutorial.thumbnail || tutorial.thumbnailUrl;
  const resources = normalizeResources(tutorial.resources);
  const paragraphs = formatWrittenContent(tutorial.writtenContent);
  const embedUrl = getEmbedUrl(tutorial.videoUrl);
  const category = tutorial.category || tutorial.topic || "General";
  const hasVideo = Boolean(tutorial.videoUrl);
  const hasArticle = paragraphs.length > 0;
  const publishedDate = tutorial.createdAt
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(tutorial.createdAt))
    : null;

  return (
    <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
      <div className="mx-auto max-w-content">
        <button
          type="button"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
          onClick={handleBack}
        >
          <FiArrowLeft />
          <span>Back to Tutorials</span>
        </button>

        <section className="relative grid gap-8 rounded-[32px] border border-border bg-light-tertiary p-6 shadow-card lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <button
            type="button"
            className={`absolute right-6 top-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-white text-lg shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none ${
              isBookmarked
                ? "border-accent/30 text-accent"
                : "border-border text-dark"
            }`}
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

          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-md">
            <div className="aspect-[4/3] bg-light-secondary">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={tutorial.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece8e4] via-[#f6f2ee] to-[#e5dfda]">
                  <div className="space-y-3 text-center text-dark-secondary">
                    <FiFileText className="mx-auto text-4xl text-accent" />
                    <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                      Tutorial Preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-3 pt-10 lg:pt-0">
              <span className="rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                {category}
              </span>
              {hasVideo ? (
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-secondary">
                  Video
                </span>
              ) : null}
              {hasArticle ? (
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-secondary">
                  Written Guide
                </span>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-dark sm:text-5xl">
                {tutorial.title}
              </h1>
              <p className="max-w-4xl text-base leading-8 text-dark-secondary">
                {tutorial.description || "Tutorial details will be available soon."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                      {formatDuration(tutorial.duration)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <FiFileText />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Format
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {hasVideo && hasArticle
                        ? "Video + written guide"
                        : hasVideo
                        ? "Video tutorial"
                        : hasArticle
                        ? "Written guide"
                        : "Reference tutorial"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {publishedDate ? (
                <p className="text-sm text-dark-secondary">Published {publishedDate}</p>
              ) : null}

              {isAdmin ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-secondary"
                  onClick={() => navigate(`/academy/tutorials/${id}/edit`)}
                >
                  <FiEdit3 />
                  <span>Edit Tutorial</span>
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Overview
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">What this tutorial covers</h2>
              <div className="mt-6 text-sm leading-8 text-dark-secondary">
                <p>{tutorial.description || "No overview has been added yet."}</p>
              </div>
            </div>

            {hasVideo ? (
              <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Video
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Watch the tutorial</h2>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-border bg-[#111]">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={tutorial.title}
                      className="aspect-video w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="space-y-4 px-6 py-10 text-white">
                      <FiVideo className="text-3xl text-white/80" />
                      <p className="max-w-2xl text-sm leading-7 text-white/75">
                        We couldn&apos;t embed this video, but you can still open it in a
                        new tab.
                      </p>
                      <a
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:bg-light-secondary"
                        href={tutorial.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiExternalLink />
                        <span>Open Video</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {paragraphs.length > 0 ? (
              <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Written Guide
                </p>
                <h2 className="mt-2 text-3xl font-bold text-dark">Step-by-step notes</h2>

                <div className="mt-6 space-y-5 text-sm leading-8 text-dark-secondary">
                  {paragraphs.map((paragraph, index) => (
                    <p key={`paragraph-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-8">
            <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Save for later
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">
                {isBookmarked ? "Bookmarked" : "Bookmark this tutorial"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-dark-secondary">
                {isAuthenticated
                  ? "Saved tutorials stay attached to your profile so you can return to them later."
                  : "Sign in to keep tutorials in your profile and restore the bookmark automatically after login."}
              </p>

              <button
                type="button"
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  isBookmarked
                    ? "bg-dark text-white hover:bg-dark-secondary"
                    : "bg-accent text-white hover:bg-accent-tertiary"
                }`}
                onClick={() => setBookmark(!isBookmarked)}
                disabled={isSaving}
              >
                {isBookmarked ? <BsBookmarkFill /> : <BsBookmark />}
                <span>{isBookmarked ? "Remove Bookmark" : "Save Tutorial"}</span>
              </button>
            </div>

            <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Resources
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">Downloads & links</h2>

              {resources.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {resources.map((resource, index) => (
                    <a
                      key={`${resource.label}-${index}`}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-light-tertiary px-4 py-4 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-white"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="rounded-xl bg-white p-3 text-accent shadow-sm">
                          <FiLink />
                        </span>
                        <span>{resource.label}</span>
                      </span>
                      <span className="inline-flex items-center gap-2 text-accent">
                        <span>Open</span>
                        <FiExternalLink />
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm leading-7 text-dark-secondary">
                  No downloadable resources have been added yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {modal.open ? (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35 px-4"
            role="dialog"
            aria-modal="true"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-md rounded-[28px] border border-white/50 bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-dark">{modal.title}</h3>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                {modal.message}
              </p>
              <button
                type="button"
                className="mt-6 w-full rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TutorialDetail;
