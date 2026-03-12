import React from 'react';
import PropTypes from 'prop-types';
import { FiDollarSign, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';

function AcademyAudienceCards({ onBrowseCourses, onCreateContent }) {
  return (
    <div className="hero-sections">
      <div className="hero-section">
        <div className="section-image-wrap">
          <img
            className="section-image"
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
            alt="Learners collaborating around laptops"
            loading="lazy"
          />
        </div>
        <span className="section-kicker">For Learners</span>
        <h2 className="section-title">Master freelancing skills</h2>
        <p className="section-description">
          Follow curated paths designed by working freelancers. Practice with real scenarios,
          get mentor feedback, and move from learning mode to earning mode faster.
        </p>

        <div className="section-tags" aria-label="Learner highlights">
          <span className="section-tag">Structured roadmap</span>
          <span className="section-tag">Skill drills</span>
          <span className="section-tag">Portfolio outcomes</span>
        </div>

        <div className="section-points">
          <div className="section-point">
            <span className="point-icon" aria-hidden="true">
              <FiTarget />
            </span>
            <div>
              <h4>Skill-by-skill progression</h4>
              <p>Clear milestones help you build confidence from fundamentals to delivery.</p>
            </div>
          </div>
          <div className="section-point">
            <span className="point-icon" aria-hidden="true">
              <FiTrendingUp />
            </span>
            <div>
              <h4>Proof you can show clients</h4>
              <p>Turn each lesson into practical artifacts that strengthen your profile.</p>
            </div>
          </div>
        </div>

        <button className="section-button" onClick={onBrowseCourses}>
          Start Learning
        </button>
      </div>

      <div className="hero-section">
        <div className="section-image-wrap">
          <img
            className="section-image"
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
            alt="Presenter teaching a seminar to a group"
            loading="lazy"
          />
        </div>
        <span className="section-kicker">For Creators</span>
        <h2 className="section-title">Share your expertise</h2>
        <p className="section-description">
          Teach what you know through courses, seminars, and tutorials that are easy to launch.
          Grow your authority, help learners succeed, and create recurring income.
        </p>

        <div className="section-tags" aria-label="Creator highlights">
          <span className="section-tag">Creator toolkit</span>
          <span className="section-tag">Audience growth</span>
          <span className="section-tag">Revenue options</span>
        </div>

        <div className="section-points">
          <div className="section-point">
            <span className="point-icon" aria-hidden="true">
              <FiZap />
            </span>
            <div>
              <h4>Build authority with consistency</h4>
              <p>Publish with a repeatable format that keeps your content polished.</p>
            </div>
          </div>
          <div className="section-point">
            <span className="point-icon" aria-hidden="true">
              <FiDollarSign />
            </span>
            <div>
              <h4>Monetize expertise your way</h4>
              <p>Mix free and paid formats to scale impact and sustainable earnings.</p>
            </div>
          </div>
        </div>

        <button className="section-button" onClick={onCreateContent}>
          Start Creating
        </button>
      </div>
    </div>
  );
}

AcademyAudienceCards.propTypes = {
  onBrowseCourses: PropTypes.func,
  onCreateContent: PropTypes.func,
};

export default AcademyAudienceCards;
