import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

function AcademyTopPicksCarousel({ featuredLoading, featuredTracks }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideStep, setSlideStep] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const carouselWindowRef = useRef(null);

  const handleNextSlide = () => {
    if (featuredTracks.length <= 1) {
      return;
    }

    setActiveSlide((prev) => (prev + 1) % featuredTracks.length);
  };

  const handlePrevSlide = () => {
    if (featuredTracks.length <= 1) {
      return;
    }

    setActiveSlide((prev) => (prev - 1 + featuredTracks.length) % featuredTracks.length);
  };

  useEffect(() => {
    if (isPaused || featuredTracks.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredTracks.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [featuredTracks.length, isPaused]);

  useEffect(() => {
    if (featuredTracks.length === 0) {
      setActiveSlide(0);
      return;
    }

    if (activeSlide > featuredTracks.length - 1) {
      setActiveSlide(0);
    }
  }, [activeSlide, featuredTracks.length]);

  useEffect(() => {
    const updateSlideStep = () => {
      if (!carouselWindowRef.current) {
        return;
      }

      const windowWidth = carouselWindowRef.current.clientWidth;
      const isCompact = window.matchMedia('(max-width: 768px)').matches;
      const peek = isCompact ? 24 : 120;
      const gap = isCompact ? 12 : 16;
      const nextStep = Math.max(windowWidth - peek + gap, windowWidth * 0.6);

      setSlideStep(nextStep);
    };

    updateSlideStep();
    window.addEventListener('resize', updateSlideStep);

    return () => window.removeEventListener('resize', updateSlideStep);
  }, []);

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) {
      setIsPaused(false);
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;
    const swipeThreshold = 50;

    if (deltaX > swipeThreshold) {
      handleNextSlide();
    } else if (deltaX < -swipeThreshold) {
      handlePrevSlide();
    }

    setTouchStartX(null);
    setIsPaused(false);
  };

  return (
    <section className="relative my-10 mb-8 overflow-hidden rounded-[30px] border border-border bg-light-tertiary p-8 shadow-card backdrop-blur-[8px] before:absolute before:left-0 before:top-0 before:h-full before:w-2 before:bg-[linear-gradient(180deg,rgba(244,102,62,0.22)_0%,rgba(244,102,62,1)_16%,rgba(244,102,62,1)_84%,rgba(244,102,62,0.22)_100%)] before:content-[''] md:p-6" aria-label="Featured learning carousel">
      <div className="mb-6 flex items-end justify-start gap-5 md:flex-col md:items-start">
        <div>
          <span className="mb-1.5 inline-block text-[11px] font-bold uppercase tracking-[2px] text-accent">Top Picks</span>
          <h3 className="text-[30px] text-dark-primary md:text-2xl">Current academy highlights</h3>
        </div>
      </div>

      {featuredLoading ? (
        <p className="rounded-lg border border-border bg-light-secondary px-[18px] py-[30px] text-center text-md text-dark-secondary">Loading top picks...</p>
      ) : featuredTracks.length === 0 ? (
        <p className="rounded-lg border border-border bg-light-secondary px-[18px] py-[30px] text-center text-md text-dark-secondary">No top picks are available yet.</p>
      ) : (
        <>
          <div
            className="overflow-hidden"
            ref={carouselWindowRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex gap-4 transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${activeSlide * slideStep}px)` }}>
              {featuredTracks.map((track, index) => (
                <article
                  className={`grid min-w-[calc(100%-120px)] flex-[0_0_calc(100%-120px)] grid-cols-1 items-center gap-5 rounded-2xl border border-border p-8 md:min-w-[calc(100%-24px)] md:flex-[0_0_calc(100%-24px)] md:p-[22px] lg:grid-cols-[minmax(0,1fr)_280px] ${track.accent.toLowerCase() === 'warm' ? 'bg-light-secondary' : 'bg-light-secondary'}`}
                  key={`${track.id || track.title}-${index}`}
                >
                  <div className="min-w-0">
                    <span className="mb-4 inline-flex rounded-full bg-light-secondary px-[11px] py-1.5 text-[11px] font-bold uppercase tracking-[1px] text-dark-primary">{track.label}</span>
                    <h4 className="mb-4 max-w-[700px] text-3xl text-dark-primary md:text-2xl">{track.title}</h4>
                    <div className="mb-4 flex flex-wrap gap-2.5">
                      <span className="rounded-full bg-light-secondary px-2.5 py-1.5 text-xs text-[#666]">{track.level}</span>
                      <span className="rounded-full bg-light-secondary px-2.5 py-1.5 text-xs text-[#666]">{track.metaDetail}</span>
                    </div>
                    <p className="mb-5 max-w-[760px] text-base leading-[1.7] text-dark-secondary">{track.outcome}</p>
                    <button className="rounded-full border-none bg-accent px-[18px] py-[11px] text-sm font-semibold text-white transition-all duration-[250ms] ease-in-out hover:-translate-y-0.5 hover:bg-accent-tertiary hover:shadow-[0_10px_20px_rgba(244,102,62,0.28)]" type="button">
                      View Program
                    </button>
                  </div>
                  <div className="h-[230px] overflow-hidden rounded-lg border border-border shadow-card md:-order-1 md:h-[186px]">
                    <img src={track.image} alt={track.imageAlt} loading="lazy" className="block h-full w-full object-cover" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4" aria-label="Carousel controls and indicators">
            <button className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-light-tertiary text-dark-primary transition-all duration-[250ms] ease-in-out hover:-translate-y-px hover:border-[rgba(27,36,50,0.32)]" onClick={handlePrevSlide} aria-label="Previous slide">
              <svg className="h-[18px] w-[18px] stroke-current" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="flex justify-center gap-2" aria-label="Slide indicators">
              {featuredTracks.map((track, index) => (
                <button
                  key={`${track.id || track.title}-${index}`}
                  className={`h-2.5 w-2.5 rounded-full border-none transition-all duration-[250ms] ease-in-out ${activeSlide === index ? 'scale-[1.2] bg-accent' : 'bg-dark-primary/[0.28]'}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-light-tertiary text-dark-primary transition-all duration-[250ms] ease-in-out hover:-translate-y-px hover:border-[rgba(27,36,50,0.32)]" onClick={handleNextSlide} aria-label="Next slide">
              <svg className="h-[18px] w-[18px] stroke-current" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </>
      )}
    </section>
  );
}

AcademyTopPicksCarousel.propTypes = {
  featuredLoading: PropTypes.bool,
  featuredTracks: PropTypes.array,
};

export default AcademyTopPicksCarousel;
