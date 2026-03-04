import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClock, FiExternalLink, FiVideo } from "react-icons/fi";
import { getSeminarLocalScheduleLabel, getSeminarStatus } from "../../../utils/seminarStatus";
import "./SeminarDetails.css";

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
    const numMinutes = Number(duration);
    if (isNaN(numMinutes)) return duration;

    if (numMinutes < 60) return `${numMinutes} minutes`;

    const hours = Math.floor(numMinutes / 60);
    const mins = numMinutes % 60;

    if (mins === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
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
                const response = await fetch(`/api/academy/seminars/${id}`, { credentials: "include" });
                if (!response.ok) {
                    throw new Error("Failed to load seminar details");
                }

                const data = await response.json();
                setSeminar(data);
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
    const canJoinZoom = status === "Live Now" && Boolean(seminar?.schedule?.zoomMeetingId) && Boolean(seminar?.schedule?.zoomPassword);

    const startsIn = useMemo(() => {
        if (status !== "Future") return "";
        const startAt = seminar?.schedule?.startAt ? new Date(seminar.schedule.startAt).getTime() : NaN;
        if (Number.isNaN(startAt)) return "";
        return formatTimeUntilStart(startAt - now);
    }, [seminar, status, now]);

    if (loading) {
        return <div className="seminar-details-feedback">Loading seminar details...</div>;
    }

    if (error) {
        return <div className="seminar-details-feedback">{error}</div>;
    }

    if (!seminar) {
        return <div className="seminar-details-feedback">Seminar not found.</div>;
    }

    const speakerName = seminar.speaker?.name || "Unknown Speaker";
    const speakerInitial = speakerName.trim().charAt(0).toUpperCase() || "S";
    const isLive = status === "Live Now";
    const isFuture = status === "Future";

    return (
        <div className="seminar-details-page">
            <div className="seminar-details-container">
                <button type="button" onClick={() => navigate("/academy/seminars")} className="seminar-details-back-btn">
                    <FiArrowLeft size={18} /> Back to Seminars
                </button>

                <div className="seminar-details-layout">
                    <section className="seminar-details-main">
                        <div className="seminar-hero-card">
                            <div className="seminar-hero-media">
                                {seminar.thumbnail ? (
                                    <img src={seminar.thumbnail} alt={seminar.title} className="seminar-hero-image" />
                                ) : (
                                    <div className="seminar-hero-fallback">
                                        <FiVideo size={72} />
                                    </div>
                                )}
                                <span className={`seminar-status-pill seminar-status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
                                    {isLive ? "Live" : status}
                                </span>
                            </div>

                            <div className="seminar-hero-content">
                                <h1 className="seminar-details-title">{seminar.title}</h1>
                                <p className="seminar-details-description">{seminar.description}</p>
                            </div>
                        </div>

                        <div className="seminar-details-card">
                            <h3>About This Event</h3>
                            <div className="seminar-details-meta-list">
                                <div className="seminar-details-meta-item">
                                    <span className="seminar-details-meta-label"><FiCalendar /> Date & Time</span>
                                    <span>{getSeminarLocalScheduleLabel(seminar)}</span>
                                </div>

                                <div className="seminar-details-meta-item">
                                    <span className="seminar-details-meta-label"><FiClock /> Duration</span>
                                    <span>{formatDuration(seminar.duration)}</span>
                                </div>

                                {isFuture && startsIn ? (
                                    <div className="seminar-details-meta-item">
                                        <span className="seminar-details-meta-label">Starts in</span>
                                        <span className="seminar-details-starts-in">{startsIn}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                    </section>

                    <aside className="seminar-details-sidebar">
                        <div className="seminar-details-card seminar-action-card">
                            <h3>{isLive ? "Join Now" : isFuture ? "Upcoming Seminar" : "Seminar Ended"}</h3>
                            {canJoinZoom ? (
                                <button
                                    type="button"
                                    className="seminar-details-join-btn"
                                    onClick={() => navigate(`/academy/seminars/${id}/join`)}
                                >
                                    <FiExternalLink />
                                    <span>Join Live Session</span>
                                </button>
                            ) : (
                                <p className="seminar-details-note">
                                    Zoom join is only enabled while the seminar is live.
                                    {isFuture ? " Please come back closer to start time." : " This seminar has ended."}
                                </p>
                            )}
                        </div>

                        <div className="seminar-details-card seminar-speaker-card">
                            <h3>Speaker</h3>
                            <div className="seminar-speaker-header">
                                {seminar.speaker?.avatar ? (
                                    <img src={seminar.speaker.avatar} alt={speakerName} className="seminar-speaker-avatar" />
                                ) : (
                                    <div className="seminar-speaker-fallback">{speakerInitial}</div>
                                )}
                                <div>
                                    <p className="seminar-speaker-name">{speakerName}</p>
                                </div>
                            </div>
                            <p className="seminar-speaker-bio">{seminar.speaker?.bio || "Speaker bio will be available soon."}</p>
                        </div>

                        <div className="seminar-details-card">
                            <h3>What to Expect</h3>
                            <div className="seminar-expect-list">
                                <p>Interactive Q&A with the speaker</p>
                                <p>Live discussion and practical examples</p>
                                <p>Clear takeaways you can apply immediately</p>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}

export default SeminarDetails;
