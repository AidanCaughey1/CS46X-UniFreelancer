import React from 'react';
import { FiCompass, FiStar, FiTool, FiUsers } from 'react-icons/fi';

function AcademyBenefits() {
  return (
    <section className="rounded-[30px] border border-border bg-light-tertiary p-10 shadow-card md:p-7">
      <div className="mb-8">
        <div className="mb-0 max-w-[640px]">
          <h3 className="mb-3 text-3xl text-dark-primary">Why Academy works</h3>
          <p className="text-base leading-[1.6] text-dark-secondary">
            A focused learning environment that blends guided curriculum, practical delivery,
            and community momentum.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[18px] border border-border bg-main-bg p-5 transition-all duration-[350ms] ease-in-out hover:-translate-y-1 hover:shadow-card-hover">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-transparent text-xl text-[#111]" aria-hidden="true">
              <FiCompass className="block h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="inline-block text-[8px] font-bold uppercase tracking-[0.9px] text-accent">Learning Design</span>
          </div>
          <h4 className="mb-2 text-base text-dark-primary">Guided, not overwhelming</h4>
          <p className="text-sm leading-[1.6] text-dark-secondary">Roadmaps remove guesswork so you can focus on progress, not planning.</p>
        </div>
        <div className="rounded-[18px] border border-border bg-main-bg p-5 transition-all duration-[350ms] ease-in-out hover:-translate-y-1 hover:shadow-card-hover">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-transparent text-xl text-[#111]" aria-hidden="true">
              <FiTool className="block h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="inline-block text-[8px] font-bold uppercase tracking-[0.9px] text-accent">Hands-On</span>
          </div>
          <h4 className="mb-2 text-base text-dark-primary">Practice tied to outcomes</h4>
          <p className="text-sm leading-[1.6] text-dark-secondary">Every module ends with project output you can use in real client work.</p>
        </div>
        <div className="rounded-[18px] border border-border bg-main-bg p-5 transition-all duration-[350ms] ease-in-out hover:-translate-y-1 hover:shadow-card-hover">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-transparent text-xl text-[#111]" aria-hidden="true">
              <FiStar className="block h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="inline-block text-[8px] font-bold uppercase tracking-[0.9px] text-accent">Career Lift</span>
          </div>
          <h4 className="mb-2 text-base text-dark-primary">Signal your capabilities</h4>
          <p className="text-sm leading-[1.6] text-dark-secondary">Show badges, deliverables, and progress artifacts that build trust fast.</p>
        </div>
        <div className="rounded-[18px] border border-border bg-main-bg p-5 transition-all duration-[350ms] ease-in-out hover:-translate-y-1 hover:shadow-card-hover">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-transparent text-xl text-[#111]" aria-hidden="true">
              <FiUsers className="block h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="inline-block text-[8px] font-bold uppercase tracking-[0.9px] text-accent">Community</span>
          </div>
          <h4 className="mb-2 text-base text-dark-primary">Momentum from peers</h4>
          <p className="text-sm leading-[1.6] text-dark-secondary">Stay accountable with creators and learners sharing wins each week.</p>
        </div>
      </div>
    </section>
  );
}

export default AcademyBenefits;
