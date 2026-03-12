import React from 'react';
import { FiCompass, FiStar, FiTool, FiUsers } from 'react-icons/fi';

function AcademyBenefits() {
  return (
    <section className="academy-benefits">
      <div className="benefits-top">
        <div className="benefits-header">
          <h3>Why Academy works</h3>
          <p>
            A focused learning environment that blends guided curriculum, practical delivery,
            and community momentum.
          </p>
        </div>
      </div>
      <div className="benefits-grid">
        <div className="benefit-card">
          <div className="benefit-head">
            <span className="benefit-icon" aria-hidden="true">
              <FiCompass />
            </span>
            <span className="benefit-label">Learning Design</span>
          </div>
          <h4>Guided, not overwhelming</h4>
          <p>Roadmaps remove guesswork so you can focus on progress, not planning.</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-head">
            <span className="benefit-icon" aria-hidden="true">
              <FiTool />
            </span>
            <span className="benefit-label">Hands-On</span>
          </div>
          <h4>Practice tied to outcomes</h4>
          <p>Every module ends with project output you can use in real client work.</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-head">
            <span className="benefit-icon" aria-hidden="true">
              <FiStar />
            </span>
            <span className="benefit-label">Career Lift</span>
          </div>
          <h4>Signal your capabilities</h4>
          <p>Show badges, deliverables, and progress artifacts that build trust fast.</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-head">
            <span className="benefit-icon" aria-hidden="true">
              <FiUsers />
            </span>
            <span className="benefit-label">Community</span>
          </div>
          <h4>Momentum from peers</h4>
          <p>Stay accountable with creators and learners sharing wins each week.</p>
        </div>
      </div>
    </section>
  );
}

export default AcademyBenefits;
