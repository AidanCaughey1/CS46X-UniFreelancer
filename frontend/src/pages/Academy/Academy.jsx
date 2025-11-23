import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Academy.css';

function Academy() {
  const navigate = useNavigate();

  const handleCreateContent = () => {
    navigate('/academy/create');
  };

  const handleBrowseCourses = () => {
    navigate('/academy/courses');
  };

  return (
    <div className="academy-page">
      <div className="academy-container">
        <h1 className="academy-title">UniFreelancer Academy</h1>
        <p className="academy-description">
          UniFreelancer cares about education and continued support for university students and
          alumni entering or already working in the freelance industry. The UniFreelancer Academy
          offers courses, workshops and tutorials to help make you a better freelancer!
        </p>

        <div className="hero-sections">
          {/* Learning Hub Section */}
          <div className="hero-section">
            <span className="section-kicker">For Learners</span>
            <h2 className="section-title">Master freelancing skills</h2>
            <p className="section-description">
              Follow curated learning paths designed by industry professionals. Complete hands-on 
              assignments and earn badges that showcase your expertise.
            </p>

            <div className="section-points">
              <div className="section-point">
                <span className="point-icon">🎯</span>
                <div>
                  <h4>Structured Pathways</h4>
                  <p>Step-by-step curriculum from fundamentals to mastery.</p>
                </div>
              </div>
              <div className="section-point">
                <span className="point-icon">📈</span>
                <div>
                  <h4>Track Your Progress</h4>
                  <p>Earn badges and showcase your achievements to clients.</p>
                </div>
              </div>
            </div>

            <button className="section-button" onClick={handleBrowseCourses}>
              Start Learning
            </button>
          </div>

          {/* Share Your Expertise Section */}
          <div className="hero-section">
            <span className="section-kicker">For Creators</span>
            <h2 className="section-title">Share your expertise</h2>
            <p className="section-description">
              Help other freelancers succeed by creating and sharing courses, seminars, or 
              tutorials. Build your brand while earning revenue.
            </p>

            <div className="section-points">
              <div className="section-point">
                <span className="point-icon">💡</span>
                <div>
                  <h4>Build Your Brand</h4>
                  <p>Establish yourself as an expert in your field.</p>
                </div>
              </div>
              <div className="section-point">
                <span className="point-icon">💰</span>
                <div>
                  <h4>Earn Revenue</h4>
                  <p>Monetize your knowledge with paid courses.</p>
                </div>
              </div>
            </div>

            <button className="section-button" onClick={handleCreateContent}>
              Start Creating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Academy;
