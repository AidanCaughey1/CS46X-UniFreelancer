import React from 'react';
import PropTypes from 'prop-types';

function AcademyHero({ onBrowseCourses, onCreateContent }) {
  return (
    <section className="academy-hero">
      <div className="academy-hero-layout">
        <div className="hero-content">
          <span className="hero-kicker">UniFreelancer Academy</span>
          <h1 className="academy-title">Build a freelancing career with confidence.</h1>
          <p className="academy-description">
            UniFreelancer cares about education and continued support for university students and
            alumni entering or already working in the freelance industry. The UniFreelancer Academy
            offers courses, workshops and tutorials to help make you a better freelancer!
          </p>
          <div className="hero-actions">
            <button className="hero-button primary" onClick={onBrowseCourses}>
              Browse Courses
            </button>
            <button className="hero-button ghost" onClick={onCreateContent}>
              Create Content
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card large">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="visual-card small top">
            <img
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=900&q=80"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="visual-card small bottom">
            <img
              src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=900&q=80"
              alt=""
              loading="lazy"
            />
          </div>
          <span className="visual-badge badge-one">Self-paced learning</span>
          <span className="visual-badge badge-two">Creator-led sessions</span>
        </div>
      </div>
    </section>
  );
}

AcademyHero.propTypes = {
  onBrowseCourses: PropTypes.func,
  onCreateContent: PropTypes.func,
};

export default AcademyHero;
