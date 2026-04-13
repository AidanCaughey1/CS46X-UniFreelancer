import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiClock,
  FiExternalLink,
  FiUser,
  FiVideo
} from "react-icons/fi";
import {
  getSeminarLocalScheduleLabel,
  getSeminarStatus
} from "../../../utils/seminarStatus";

const defaultExpectHighlights = [
  "Interactive Q&A with the speaker",
  "Live discussion with practical examples",
  "Clear takeaways you can apply immediately"
];

const formatTimeUntilStart = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "Starting soon";
  }

  const totalMinutes = Math.ceil(milliseconds / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
};

const formatDuration = (duration) => {
  if (!duration) return "Not specified";

  const minutes = Number(duration);
  if (Number.isNaN(minutes)) return duration;
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder
    ? `${hours} hour${hours > 1 ? "s" : ""} ${remainder} minute${remainder > 1 ? "s" : ""}`
    : `${hours} hour${hours > 1 ? "s" : ""}`;
};

const statusClasses = {
  Future: "bg-accent/10 text-accent",
  "Live Now": "bg-[#e8f7ef] text-[#18794e]",
  Past: "bg-[#efefef] text-dark-secondary"
};

function SeminarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seminar, setSeminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchSeminar = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/academy/seminars/${id}`, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to load seminar details");
        }

        const data = await response.json();
        setSeminar(data);
        setError("");
      } catch (fetchError) {
        setError(fetchError.message || "Could not load seminar");
      } finally {
        setLoading(false);
      }
    };

    fetchSeminar();
  }, [id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const status = useMemo(() => getSeminarStatus(seminar, now), [seminar, now]);
  const isLive = status === "Live Now";
  const isFuture = status === "Future";
  const canJoinZoom =
    isLive &&
    Boolean(seminar?.schedule?.zoomMeetingId) &&
    Boolean(seminar?.schedule?.zoomPassword);

  const expectHighlights = useMemo(() => {
    const customHighlights = Array.isArray(seminar?.highlights)
      ? seminar.highlights
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
          .slice(0, 3)
      : [];

    return customHighlights.length > 0
      ? customHighlights
      : defaultExpectHighlights;
  }, [seminar]);

  const startsIn = useMemo(() => {
    if (!isFuture) return "";
    const startAt = seminar?.schedule?.startAt
      ? new Date(seminar.schedule.startAt).getTime()
      : NaN;

    if (Number.isNaN(startAt)) return "";
    return formatTimeUntilStart(startAt - now);
  }, [isFuture, now, seminar]);

  if (loading) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content rounded-[32px] border border-border bg-white px-6 py-16 text-center text-dark-secondary shadow-card">
          Loading seminar details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <button
            type="button"
            onClick={() => navigate("/academy/seminars")}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
          >
            <FiArrowLeft />
            <span>Back to Seminars</span>
          </button>

          <div className="rounded-[32px] border border-border bg-white px-6 py-16 text-center shadow-card">
            <h1 className="text-3xl font-bold text-dark">Unable to load seminar</h1>
            <p className="mx-auto mt-4 max-w-2xl text-dark-secondary">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!seminar) {
    return (
      <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content rounded-[32px] border border-border bg-white px-6 py-16 text-center shadow-card">
          Seminar not found.
        </div>
      </div>
    );
  }

  const speakerName = seminar.speaker?.name || "Unknown Speaker";
  const speakerInitial = speakerName.trim().charAt(0).toUpperCase() || "S";
  const localScheduleLabel = getSeminarLocalScheduleLabel(seminar);
  const actionTitle = isLive
    ? "Join the live session"
    : isFuture
    ? "Upcoming seminar"
    : "Seminar ended";
  const actionCopy = canJoinZoom
    ? "Zoom access is active while the seminar is live."
    : isFuture
    ? "Join access opens automatically once the seminar is live."
    : "This session has finished. Check back for future seminars.";

  return (
    <div className="min-h-screen bg-main-bg px-4 py-8 font-academy sm:px-6 lg:px-8">
      <div className="mx-auto max-w-content">
        <button
          type="button"
          onClick={() => navigate("/academy/seminars")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
        >
          <FiArrowLeft />
          <span>Back to Seminars</span>
        </button>

        <section className="grid gap-8 rounded-[32px] border border-border bg-light-tertiary p-6 shadow-card lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
              <span
                className={`rounded-full px-4 py-2 ${
                  statusClasses[status] || "bg-white text-dark-secondary"
                }`}
              >
                {isLive ? "Live now" : status}
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-dark-secondary">
                Seminar
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-dark sm:text-5xl">
                {seminar.title}
              </h1>
              <p className="max-w-4xl text-lg leading-relaxed text-dark-secondary">
                {seminar.description || "Seminar details will be available soon."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Schedule
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {localScheduleLabel}
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
                      {formatDuration(seminar.duration)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <FiUser />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Speaker
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {speakerName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                About this event
              </p>
              <p className="mt-3 text-sm leading-7 text-dark-secondary">
                {seminar.description || "No detailed event description has been added yet."}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-md">
              <div className="relative aspect-[4/3] bg-light-secondary">
                {seminar.thumbnail ? (
                  <img
                    src={seminar.thumbnail}
                    alt={seminar.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece8e4] via-[#f6f2ee] to-[#e5dfda]">
                    <div className="space-y-3 text-center text-dark-secondary">
                      <FiVideo className="mx-auto text-4xl text-accent" />
                      <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Seminar Preview
                      </p>
                    </div>
                  </div>
                )}

                {isFuture && startsIn ? (
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark shadow-sm backdrop-blur-sm">
                    Starts in {startsIn}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-dark bg-dark px-5 py-5 text-white shadow-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Access
              </p>
              <h2 className="mt-2 text-2xl font-bold">{actionTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">{actionCopy}</p>

              {canJoinZoom ? (
                <button
                  type="button"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
                  onClick={() => navigate(`/academy/seminars/${id}/join`)}
                >
                  <FiExternalLink />
                  <span>Join Live Session</span>
                </button>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/75">
                  Zoom join is enabled only when the seminar is actively live.
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-border bg-white px-5 py-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Speaker
              </p>
              <div className="mt-4 flex items-start gap-4">
                {seminar.speaker?.avatar ? (
                  <img
                    src={seminar.speaker.avatar}
                    alt={speakerName}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-light-tertiary text-xl font-bold text-dark">
                    {speakerInitial}
                  </div>
                )}

                <div>
                  <p className="text-lg font-semibold text-dark">{speakerName}</p>
                  <p className="mt-2 text-sm leading-7 text-dark-secondary">
                    {seminar.speaker?.bio || "Speaker bio will be available soon."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              What to expect
            </p>
            <h2 className="mt-2 text-3xl font-bold text-dark">Live session highlights</h2>

            <div className="mt-8 space-y-4">
              {expectHighlights.map((highlight, index) => (
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

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Timing
            </p>
            <h2 className="mt-2 text-3xl font-bold text-dark">Attendance details</h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-light-tertiary px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Local date & time
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-dark">
                  {localScheduleLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-light-tertiary px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Current status
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-dark">
                  {isLive ? "Live now" : status}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-light-tertiary px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Duration
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-dark">
                  {formatDuration(seminar.duration)}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-light-tertiary px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Join policy
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-dark">
                  {canJoinZoom
                    ? "Zoom access is available."
                    : isFuture
                    ? "Enabled automatically at go-live."
                    : "Join access is no longer available."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SeminarDetails;
