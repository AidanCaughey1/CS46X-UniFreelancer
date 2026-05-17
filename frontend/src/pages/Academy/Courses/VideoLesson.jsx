import React from "react";
import "./CourseLearning.css";

function VideoLesson({ lesson, onComplete, isCompleted }) {
  const toEmbedUrl = (url) => {
    if (!url) {
      return "";
    }

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtube.com") && parsedUrl.pathname.startsWith("/embed/")) {
        return url;
      }

      if (parsedUrl.hostname === "youtu.be") {
        const id = parsedUrl.pathname.replace("/", "");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      if (parsedUrl.hostname.includes("youtube.com")) {
        const videoId = parsedUrl.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      if (parsedUrl.hostname.includes("vimeo.com") && !parsedUrl.hostname.includes("player.vimeo.com")) {
        const parts = parsedUrl.pathname.split("/").filter(Boolean);
        const videoId = [...parts].reverse().find((part) => /^\d+$/.test(part));
        return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
      }

      if (parsedUrl.hostname.includes("player.vimeo.com") && parsedUrl.pathname.startsWith("/video/")) {
        return url;
      }

      return "";
    } catch {
      return "";
    }
  };

  const embedUrl = toEmbedUrl(lesson.videoUrl);

  return (
    <div className="video-lesson">
      <div className="lesson-header">
        <h2>{lesson.title}</h2>
        {lesson.duration && (
          <span className="duration-badge">{lesson.duration}</span>
        )}
      </div>

      <div className="video-container">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="video-player"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-placeholder">Video URL not available</div>
        )}
      </div>

      <div className="lesson-actions">
        {!isCompleted ? (
          <button className="complete-button" onClick={onComplete}>
            Mark as Complete
          </button>
        ) : (
          <div className="completed-badge">Completed</div>
        )}
      </div>
    </div>
  );
}

export default VideoLesson;
