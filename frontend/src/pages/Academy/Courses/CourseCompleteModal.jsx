import React from 'react';
import './CourseLearning.css';

function CourseCompleteModal({ course, badge, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="complete-modal">
        <div className="confetti">🎉</div>
        
        <h1>Congratulations!</h1>
        <p>You've completed the course:</p>
        <h2>{course.title}</h2>

        {badge && badge.name && (
          <div className="badge-display">
            <div 
              className="badge-icon"
              style={{ backgroundColor: badge.color || '#4F46E5' }}
            >
              {badge.imageUrl ? (
                <img src={badge.imageUrl} alt={badge.name} />
              ) : (
                <span className="badge-emoji">🏆</span>
              )}
            </div>
            <h3>{badge.name}</h3>
            <p>{badge.description}</p>
          </div>
        )}

        <button className="close-modal-button" onClick={onClose}>
          Return to My Courses
        </button>
      </div>
    </div>
  );
}

export default CourseCompleteModal;