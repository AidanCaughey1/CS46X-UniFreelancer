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

  const goToCourses = () => navigate('/academy/courses');
  const goToSeminars = () => navigate('/academy/seminars');
  const goToTutorials = () => navigate('/academy/tutorials');
  const goToPodcasts = () => navigate('/academy/podcasts');

  return (
    <div className="academy-page">
      <div className="academy-container">
        <h1 className="academy-title">UniFreelancer Academy</h1>
        <p className="academy-description">
          UniFreelancer cares about education and continued support for university students and
          alumni entering or already working in the freelance industry. The UniFreelancer Academy
          offers courses, workshops and tutorials to help make you a better freelancer!
        </p>
        
        {/* Category Section */}
        <section className="categories-section">
          <h2 className="categories-title">Explore learning formats</h2>
          <p className="categories-description">
            Learn in the way that works best for you! Deep multi-week courses, live seminars,
            quick tutorials, or on-the-go podcasts.
          </p>

          <div className="categories-grid">
            <button className="category-card" onClick={goToCourses}>
              <div className="category-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Courses"
                  className="category-image"
                />
              </div>
              <div className="category-body">
                <h3 className="category-title">Courses</h3>
                <p className="category-text">
                  Structured learning paths with projects, assessments, and certificates.
                </p>
              </div>
            </button>

            <button className="category-card" onClick={goToSeminars}>
              <div className="category-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80"
                  alt="Seminars"
                  className="category-image"
                />
              </div>
              <div className="category-body">
                <h3 className="category-title">Seminars</h3>
                <p className="category-text">
                  Live or recorded sessions with industry experts on focused freelancing topics.
                </p>
              </div>
            </button>

            <button className="category-card" onClick={goToTutorials}>
              <div className="category-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
                  alt="Tutorials"
                  className="category-image"
                />
              </div>
              <div className="category-body">
                <h3 className="category-title">Tutorials</h3>
                <p className="category-text">
                  Short, practical guides to help you learn specific tools and workflows fast.
                </p>
              </div>
            </button>

            <button className="category-card" onClick={goToPodcasts}>
              <div className="category-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?auto=format&fit=crop&w=800&q=80"
                  alt="Podcasts"
                  className="category-image"
                />
              </div>
              <div className="category-body">
                <h3 className="category-title">Podcasts</h3>
                <p className="category-text">
                  Listen to stories, strategies, and interviews with successful freelancers.
                </p>
              </div>
            </button>
          </div>
        </section>

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

