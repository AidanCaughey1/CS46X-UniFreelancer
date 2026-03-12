import React from "react";
import { useNavigate } from "react-router-dom";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const priceAmount = course?.pricing?.amount ?? course?.priceAmount ?? 0;
  const isFree = Boolean(course?.isFree || course?.isLiteVersion || priceAmount === 0);

  return (
    <div
      className="course-card"
      onClick={() => navigate(`/academy/courses/${course._id}`)}
    >
      <div className="course-card-image">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} />
        ) : (
          <div className="course-card-placeholder">Course</div>
        )}
      </div>

      <div className="course-card-body">
        <h3>{course.title}</h3>

        <p className="course-card-description">
          {course.description?.slice(0, 100)}
          {course.description?.length > 100 ? "..." : ""}
        </p>

        <div className="course-card-meta">
          <div className="course-meta-item">
            <span className="meta-icon">Time</span>
            <span>{course.duration || "Self-paced"}</span>
          </div>

          <div className="course-meta-item">
            <span className="meta-icon">Topic</span>
            <span>{course.category || "General"}</span>
          </div>

          <div className="course-meta-item">
            <span className="meta-icon">Level</span>
            <span>{course.difficulty || "Beginner"}</span>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="course-price">
            {isFree ? (
              <span className="price-free">Free</span>
            ) : (
              <span className="price-paid">${priceAmount}</span>
            )}
          </div>

          <button
            className="view-details-btn"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/academy/courses/${course._id}/learn`);
            }}
          >
            Go to Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
