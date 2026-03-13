import React from 'react';
import PropTypes from 'prop-types';

function AcademyHero({ onBrowseCourses, onCreateContent }) {
  return (
    <section className="relative pb-5 pt-12">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="max-w-[820px] animate-hero-reveal">
          <span className="mb-4 inline-flex items-center rounded-full border border-accent/[0.16] bg-accent/[0.08] px-4 py-3 text-base font-bold uppercase tracking-[2.4px] text-accent">
            UniFreelancer Academy
          </span>
          <h1 className="mb-5 text-balance text-[clamp(2.2rem,5.2vw,3.95rem)] font-bold leading-none tracking-tight text-dark-primary md:text-[34px] lg:text-[46px]">
            Build a freelancing career with confidence.
          </h1>
          <p className="mb-8 max-w-[730px] text-lg leading-[1.78] text-dark-secondary md:text-base">
            UniFreelancer cares about education and continued support for university students and
            alumni entering or already working in the freelance industry. The UniFreelancer Academy
            offers courses, workshops and tutorials to help make you a better freelancer!
          </p>
          <div className="mb-8 flex flex-wrap gap-4 md:flex-col md:items-stretch">
            <button
              className="rounded-full border-none bg-gradient-to-br from-accent to-accent-secondary px-[22px] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(244,102,62,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(244,102,62,0.22)] md:w-full"
              onClick={onBrowseCourses}
            >
              Browse Courses
            </button>
            <button
              className="rounded-full border border-[rgba(27,36,50,0.1)] bg-light-tertiary px-[22px] py-3 text-sm font-semibold text-dark-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(27,36,50,0.3)] md:w-full"
              onClick={onCreateContent}
            >
              Create Content
            </button>
          </div>
        </div>

        <div className="relative min-h-[390px] lg:min-h-[340px] md:max-w-[520px] md:min-h-[300px]" aria-hidden="true">
          <div className="absolute right-0 top-[34px] h-[320px] w-[72%] rotate-2 overflow-hidden rounded-[26px] border border-border shadow-card-hover md:top-[46px] md:h-[250px] md:w-[74%]">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
              alt=""
              loading="lazy"
              className="block h-full w-full object-cover"
            />
          </div>
          <div className="absolute left-0 top-0 h-[178px] w-[46%] -rotate-[4deg] overflow-hidden rounded-[26px] border border-border shadow-card-hover md:h-[150px] md:w-[48%]">
            <img
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=900&q=80"
              alt=""
              loading="lazy"
              className="block h-full w-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-[4%] h-[178px] w-[46%] rotate-3 overflow-hidden rounded-[26px] border border-border shadow-card-hover md:h-[150px] md:w-[48%]">
            <img
              src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=900&q=80"
              alt=""
              loading="lazy"
              className="block h-full w-full object-cover"
            />
          </div>
          <span className="absolute right-[6px] top-[14px] z-[3] inline-flex items-center rounded-full border border-border bg-light-tertiary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.4px] text-dark-primary shadow-card animate-nudge-float">
            Self-paced learning
          </span>
          <span className="absolute -bottom-2 left-[10px] z-[3] inline-flex items-center rounded-full border border-border bg-light-tertiary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.4px] text-dark-primary shadow-card animate-[nudge-float_6.4s_ease-in-out_infinite]">
            Creator-led sessions
          </span>
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
