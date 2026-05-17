import React from 'react';
import './CourseLearning.css';

function PodcastLesson({ lesson, onComplete, isCompleted }) {
  const podcastData = lesson.podcastData;

  return (
    <div className="podcast-lesson">
      <div className="lesson-header">
        <h2>🎧 {lesson.title}</h2>
      </div>

      <div className="lesson-content-box">
        <h3>Lesson Content</h3>
        
        <p className="podcast-description">
          Listen to this podcast episode to gain insights on the topic.
        </p>

        {podcastData.link && (
          <a 
            href={podcastData.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="podcast-link-button"
          >
            🎧 Listen to Podcast →
          </a>
        )}
      </div>

      <div className="lesson-actions">
        {!isCompleted ? (
          <button className="complete-button" onClick={onComplete}>
            ✓ Mark as Complete
          </button>
        ) : (
          <div className="completed-badge">
            ✅ Completed
          </div>
        )}
      </div>
    </div>
  );
}

export default PodcastLesson;