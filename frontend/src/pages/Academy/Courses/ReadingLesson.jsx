import React from 'react';
import './CourseLearning.css';

function ReadingLesson({ lesson, onComplete, isCompleted }) {
  const readingData = lesson.readingData;

  return (
    <div className="reading-lesson">
      <div className="lesson-header">
        <h2>📚 {lesson.title}</h2>
      </div>

      <div className="lesson-content-box">
        <h3>Lesson Content</h3>
        
        {readingData.author && (
          <p className="reading-author">By {readingData.author}</p>
        )}

        {readingData.citation && (
          <p className="reading-citation">{readingData.citation}</p>
        )}

        <p className="reading-description">
          Read the assigned material to deepen your understanding of this topic.
        </p>

        {readingData.link && (
          <a 
            href={readingData.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="reading-link-button"
          >
            📖 Open Reading Material →
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

export default ReadingLesson;