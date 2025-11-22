import React from "react";
import { useNavigate } from "react-router-dom";
import "./Academy.css";

function Academy() {
  const navigate = useNavigate();

  return (
    <div className="academy-page">
      <div className="academy-container">

        {/* ---------------- TITLE + DESCRIPTION ---------------- */}
        <h1 className="academy-title">UniFreelancer Academy</h1>

        <p className="academy-description">
          UniFreelancer cares about education and continued support for university
          students and alumni entering or already working in the freelance
          industry. The UniFreelancer Academy offers courses, workshops, and
          tutorials to help make you a better freelancer!
        </p>

        {/* ---------------- 3 MAIN CARDS ---------------- */}
        <div className="academy-card-grid">
          {/* Courses Card */}
          <div
            className="academy-card"
            onClick={() => navigate("/academy/courses")}
          >
            <img
              src="/images/courses.JPEG"
              alt="Courses"
            />
            <div className="academy-card-title">Courses</div>
          </div>

          {/* Seminars Card */}
          <div
            className="academy-card"
            onClick={() => navigate("/academy/seminars")}
          >
            <img
              src="/images/seminars.JPEG"
              alt="Seminars"
            />
            <div className="academy-card-title">Seminars</div>
          </div>

          {/* Tutorials Card */}
          <div
            className="academy-card"
            onClick={() => navigate("/academy/tutorials")}
          >
            <img
              src="/images/tutorials.JPEG"
              alt="Tutorials"
            />
            <div className="academy-card-title">Tutorials</div>
          </div>
        </div>

        {/* ---------------- SHARE YOUR EXPERTISE CARD ---------------- */}
        <div className="share-section">
          <div className="share-icon-wrapper">+</div>

          <h3 className="share-title">Share Your Expertise</h3>

          <p className="share-description">
            Are you an expert in your field? Help other freelancers succeed by
            creating and sharing your own courses, seminars, or tutorials on the
            UniFreelancer Academy platform.
          </p>

          <button
            className="share-button"
            onClick={() => navigate("/academy/create")}
          >
            + Create Course, Seminar, or Tutorial
          </button>
        </div>

      </div>
    </div>
  );
}

export default Academy;
