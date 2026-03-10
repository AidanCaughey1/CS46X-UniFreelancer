/* global process */
import React, { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function AcademyPlans() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSignedIn = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/users/me`, {
          credentials: 'include'
        });
        setIsSignedIn(response.ok);
      } catch (_error) {
        setIsSignedIn(false);
      }
    };

    checkSignedIn();
  }, []);

  const handleFreeSelect = () => {
    if (!isSignedIn) {
      navigate('/signup');
    }
  };

  return (
    <section className="academy-plans" aria-label="Subscription plans">
      <div className="plans-header">
        <span className="showcase-kicker">Subscriptions</span>
        <h3>Pick the plan that fits your pace</h3>
        <p>Start free, then upgrade when you want deeper access and more live experiences.</p>
      </div>

      <div className="plans-grid">
        <article
          className={`plan-card plan-free ${!isSignedIn ? 'is-clickable' : ''}`}
          onClick={handleFreeSelect}
          role={!isSignedIn ? 'button' : undefined}
          tabIndex={!isSignedIn ? 0 : -1}
          onKeyDown={(event) => {
            if (isSignedIn) {
              return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleFreeSelect();
            }
          }}
          aria-label={!isSignedIn ? 'Sign up for free plan' : 'Free plan'}
        >
          <h4>Free</h4>
          <p className="plan-price">$0/mo</p>
          <p className="plan-subtitle">Get started and explore</p>
          <ul className="plan-features">
            <li><FiCheck aria-hidden="true" />Access to free courses</li>
            <li><FiCheck aria-hidden="true" />Access to free tutorials</li>
            <li><FiCheck aria-hidden="true" />Limited seminars + podcasts</li>
            <li><FiCheck aria-hidden="true" />Limited resource downloads</li>
          </ul>
          <button className="plan-button ghost" onClick={handleFreeSelect}>
            Start Free
          </button>
        </article>

        <article className="plan-card plan-plus featured">
          <span className="plan-badge">Most popular</span>
          <h4>Plus</h4>
          <p className="plan-price">$14.99/mo</p>
          <p className="plan-subtitle">Best for consistent learners</p>
          <ul className="plan-features">
            <li><FiCheck aria-hidden="true" />Access to most courses</li>
            <li><FiCheck aria-hidden="true" />Full tutorials library</li>
            <li><FiCheck aria-hidden="true" />Expanded seminars + podcasts</li>
            <li><FiCheck aria-hidden="true" />10 resource downloads / month</li>
            <li><FiCheck aria-hidden="true" />Monthly AI feedback credits</li>
          </ul>
          <button className="plan-button primary">Choose Plus</button>
        </article>

        <article className="plan-card plan-premium">
          <h4>Premium</h4>
          <p className="plan-price">$24.99/mo</p>
          <p className="plan-subtitle">For power learners and creators</p>
          <ul className="plan-features">
            <li><FiCheck aria-hidden="true" />Full access to all academy content</li>
            <li><FiCheck aria-hidden="true" />Unlimited resource downloads</li>
            <li><FiCheck aria-hidden="true" />Unlimited AI feedback (Fair Use)</li>
            <li><FiCheck aria-hidden="true" />AI-assisted creator tools</li>
          </ul>
          <p className="plan-note">Unlimited AI is subject to fair use and anti-abuse protections.</p>
          <button className="plan-button secondary">Go Premium</button>
        </article>
      </div>
    </section>
  );
}

export default AcademyPlans;
