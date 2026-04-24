import React from 'react';
import './InstructorDashboard.css';

function InstructorCourseCard({ course, onView, onEdit, onDelete, showAlert }) {

  const handleDelete = () => {
    showAlert(
      "Confirm Delete",
      "Are you sure you want to delete this course? This action cannot be undone.",
      "confirm",
      () => onDelete(course._id)
    );
  };

  return (
    <div className="instructor-course-card">

      {/* Thumbnail */}
      <div className="course-card-thumbnail">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} />
        ) : (
          <div className="placeholder-thumbnail">📚</div>
        )}
        {course.isLiteVersion && (
          <span className="lite-badge-card">Lite</span>
        )}
      </div>

      {/* Content */}
      <div className="course-card-content">
        <h3 className="course-card-title">{course.title}</h3>

        <div className="course-card-meta">
          <span className="meta-item">
            👥 {course.enrolledCount || 0} students
          </span>
          <span className="meta-item">
            📚 {course.modules?.length || 0} modules
          </span>
        </div>

        {course.pendingSubmissions > 0 && (
          <div className="pending-alert">
            ⚠️ {course.pendingSubmissions} submission
            {course.pendingSubmissions !== 1 ? 's' : ''} pending
          </div>
        )}

        <div className="course-card-price">
          {course.isFree ? (
            <span className="price-free">Free</span>
          ) : (
            <span className="price-paid">${course.priceAmount}</span>
          )}
          <span className="difficulty-badge">{course.difficulty}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="course-card-actions">
        <button
          className="action-button view-button"
          onClick={() => onView(course._id)}
        >
          View
        </button>

        <button
          className="action-button edit-button"
          onClick={() => onEdit(course._id)}
        >
          Edit
        </button>

        <button
          className="action-button delete-button"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>

    </div>
  );
}

export default InstructorCourseCard;