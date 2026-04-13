import React from 'react';
import PropTypes from 'prop-types';
import { FiDollarSign, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';

function AcademyAudienceCards({ onBrowseCourses, onCreateContent }) {
  return (
    <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-light-tertiary p-10 shadow-card transition-all duration-[350ms] ease-in-out before:absolute before:left-0 before:top-0 before:h-1.5 before:w-full before:bg-[linear-gradient(90deg,rgba(244,102,62,0.22)_0%,rgba(244,102,62,1)_18%,rgba(244,102,62,1)_82%,rgba(244,102,62,0.22)_100%)] before:content-[''] hover:-translate-y-1.5 hover:shadow-card-hover md:p-[34px_26px]">
        <div className="mb-4 overflow-hidden rounded-[14px] border border-border">
          <img
            className="block h-[172px] w-full object-cover"
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
            alt="Learners collaborating around laptops"
            loading="lazy"
          />
        </div>
        <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[2.3px] text-accent">For Learners</span>
        <h2 className="mb-4 text-4xl leading-[1.2] text-dark-primary md:text-[26px]">Master freelancing skills</h2>
        <p className="mb-5 text-md leading-[1.68] text-dark-secondary">
          Follow curated paths designed by working freelancers. Practice with real scenarios,
          get mentor feedback, and move from learning mode to earning mode faster.
        </p>

        <div className="mb-6 flex min-h-[56px] flex-wrap gap-2 md:min-h-0" aria-label="Learner highlights">
          <span className="inline-flex items-center rounded-full border border-border bg-light-secondary px-[11px] py-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-[#666]">Structured roadmap</span>
          <span className="inline-flex items-center rounded-full border border-border bg-light-secondary px-[11px] py-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-[#666]">Skill drills</span>
          <span className="inline-flex items-center rounded-full border border-border bg-light-secondary px-[11px] py-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-[#666]">Portfolio outcomes</span>
        </div>

        <div className="mb-8 flex flex-grow flex-col gap-4">
          <div className="flex items-center gap-4 rounded-[14px] border border-border bg-light-secondary px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-light-secondary text-xl text-[#111]" aria-hidden="true">
              <FiTarget className="block h-[18px] w-[18px] stroke-[#111] text-[#111]" strokeWidth={2.2} />
            </span>
            <div>
              <h4 className="mb-1 text-base font-semibold text-dark-primary">Skill-by-skill progression</h4>
              <p className="text-sm leading-normal text-dark-secondary">Clear milestones help you build confidence from fundamentals to delivery.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-[14px] border border-border bg-light-secondary px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-light-secondary text-xl text-[#111]" aria-hidden="true">
              <FiTrendingUp className="block h-[18px] w-[18px] stroke-[#111] text-[#111]" strokeWidth={2.2} />
            </span>
            <div>
              <h4 className="mb-1 text-base font-semibold text-dark-primary">Proof you can show clients</h4>
              <p className="text-sm leading-normal text-dark-secondary">Turn each lesson into practical artifacts that strengthen your profile.</p>
            </div>
          </div>
        </div>

        <button className="w-full rounded-[10px] border-none bg-accent py-3.5 text-md font-semibold text-white transition-all duration-[250ms] ease-in-out hover:-translate-y-0.5 hover:bg-accent-tertiary hover:shadow-[0_12px_24px_rgba(244,102,62,0.2)]" onClick={onBrowseCourses}>
          Start Learning
        </button>
      </div>

      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-light-tertiary p-10 shadow-card transition-all duration-[350ms] ease-in-out before:absolute before:left-0 before:top-0 before:h-1.5 before:w-full before:bg-[linear-gradient(90deg,rgba(244,102,62,0.22)_0%,rgba(244,102,62,1)_18%,rgba(244,102,62,1)_82%,rgba(244,102,62,0.22)_100%)] before:content-[''] hover:-translate-y-1.5 hover:shadow-card-hover md:p-[34px_26px]">
        <div className="mb-4 overflow-hidden rounded-[14px] border border-border">
          <img
            className="block h-[172px] w-full object-cover"
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
            alt="Presenter teaching a seminar to a group"
            loading="lazy"
          />
        </div>
        <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[2.3px] text-accent">For Creators</span>
        <h2 className="mb-4 text-4xl leading-[1.2] text-dark-primary md:text-[26px]">Share your expertise</h2>
        <p className="mb-5 text-md leading-[1.68] text-dark-secondary">
          Teach what you know through courses, seminars, and tutorials that are easy to launch.
          Grow your authority, help learners succeed, and create recurring income.
        </p>

        <div className="mb-6 flex min-h-[56px] flex-wrap gap-2 md:min-h-0" aria-label="Creator highlights">
          <span className="inline-flex items-center rounded-full border border-border bg-light-secondary px-[11px] py-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-[#666]">Creator toolkit</span>
          <span className="inline-flex items-center rounded-full border border-border bg-light-secondary px-[11px] py-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-[#666]">Audience growth</span>
          <span className="inline-flex items-center rounded-full border border-border bg-light-secondary px-[11px] py-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-[#666]">Revenue options</span>
        </div>

        <div className="mb-8 flex flex-grow flex-col gap-4">
          <div className="flex items-center gap-4 rounded-[14px] border border-border bg-light-secondary px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-light-secondary text-xl text-[#111]" aria-hidden="true">
              <FiZap className="block h-[18px] w-[18px] stroke-[#111] text-[#111]" strokeWidth={2.2} />
            </span>
            <div>
              <h4 className="mb-1 text-base font-semibold text-dark-primary">Build authority with consistency</h4>
              <p className="text-sm leading-normal text-dark-secondary">Publish with a repeatable format that keeps your content polished.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-[14px] border border-border bg-light-secondary px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-light-secondary text-xl text-[#111]" aria-hidden="true">
              <FiDollarSign className="block h-[18px] w-[18px] stroke-[#111] text-[#111]" strokeWidth={2.2} />
            </span>
            <div>
              <h4 className="mb-1 text-base font-semibold text-dark-primary">Monetize expertise your way</h4>
              <p className="text-sm leading-normal text-dark-secondary">Mix free and paid formats to scale impact and sustainable earnings.</p>
            </div>
          </div>
        </div>

        <button className="w-full rounded-[10px] border-none bg-accent py-3.5 text-md font-semibold text-white transition-all duration-[250ms] ease-in-out hover:-translate-y-0.5 hover:bg-accent-tertiary hover:shadow-[0_12px_24px_rgba(244,102,62,0.2)]" onClick={onCreateContent}>
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
