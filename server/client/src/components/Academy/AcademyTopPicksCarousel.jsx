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
    <section className="academy-showcase" aria-label="Featured learning carousel">
      <div className="showcase-header">
        <div>
          <span className="showcase-kicker">Top Picks</span>
          <h3>Current academy highlights</h3>
        </div>
      </div>

      {featuredLoading ? (
        <p className="carousel-empty">Loading top picks...</p>
      ) : featuredTracks.length === 0 ? (
        <p className="carousel-empty">No top picks are available yet.</p>
      ) : (
        <>
          <div
            className="carousel-window"
            ref={carouselWindowRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="carousel-track" style={{ transform: `translateX(-${activeSlide * slideStep}px)` }}>
              {featuredTracks.map((track, index) => (
                <article className={`feature-slide accent-${track.accent.toLowerCase()}`} key={`${track.id || track.title}-${index}`}>
                  <div className="slide-body">
                    <span className="slide-label">{track.label}</span>
                    <h4>{track.title}</h4>
                    <div className="slide-meta">
                      <span>{track.level}</span>
                      <span>{track.metaDetail}</span>
                    </div>
                    <p>{track.outcome}</p>
                    <button className="slide-cta" type="button">
                      View Program
                    </button>
                  </div>
                  <div className="slide-image">
                    <img src={track.image} alt={track.imageAlt} loading="lazy" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="carousel-footer" aria-label="Carousel controls and indicators">
            <button className="carousel-control" onClick={handlePrevSlide} aria-label="Previous slide">
              <svg className="carousel-control-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="carousel-dots" aria-label="Slide indicators">
              {featuredTracks.map((track, index) => (
                <button
                  key={`${track.id || track.title}-${index}`}
                  className={`carousel-dot ${activeSlide === index ? 'active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button className="carousel-control" onClick={handleNextSlide} aria-label="Next slide">
              <svg className="carousel-control-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
