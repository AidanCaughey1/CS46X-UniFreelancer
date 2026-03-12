import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiMic, FiVideo } from 'react-icons/fi';

const formatSlides = [
  {
    title: 'Courses',
    description: 'Comprehensive, self-paced learning paths for deep skill building.',
    points: ['Quizzes', 'Assignments', 'Videos', 'Articles'],
    icon: FiBookOpen,
    route: '/academy/courses'
  },
  {
    title: 'Seminars',
    description: 'Live sessions covering focused freelance and career topics.',
    points: ['Live sessions', 'Topic deep dives', 'Q&A segments', 'Expert speakers'],
    icon: FiCalendar,
    route: '/academy/seminars'
  },
  {
    title: 'Tutorials',
    description: 'Short, practical lessons for fast wins and quick upskilling.',
    points: ['Video or article', 'Short format', 'Downloadable resources', 'Action steps'],
    icon: FiVideo,
    route: '/academy/tutorials'
  },
  {
    title: 'Podcasts',
    description: 'Video podcasts discussing trends, workflows, and real-world strategy.',
    points: ['Video podcasts', 'Industry conversations', 'Practical takeaways', 'On-demand playback'],
    icon: FiMic,
    route: null
  }
];

function AcademyFormatsCarousel() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideStep, setSlideStep] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const carouselWindowRef = useRef(null);

  const handleNextSlide = () => {
    if (formatSlides.length <= 1) {
      return;
    }

    setActiveSlide((prev) => (prev + 1) % formatSlides.length);
  };

  const handlePrevSlide = () => {
    if (formatSlides.length <= 1) {
      return;
    }

    setActiveSlide((prev) => (prev - 1 + formatSlides.length) % formatSlides.length);
  };

  useEffect(() => {
    if (isPaused || formatSlides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % formatSlides.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

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

  const handleFormatSelect = (slide) => {
    if (!slide.route) {
      return;
    }

    navigate(slide.route);
  };

  return (
    <section className="academy-formats" aria-label="Learning format highlights">
      <div className="formats-header">
        <span className="showcase-kicker">Explore Formats</span>
        <h3>Choose how you want to learn</h3>
      </div>

      <div
        className="formats-window"
        ref={carouselWindowRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="formats-track" style={{ transform: `translateX(-${activeSlide * slideStep}px)` }}>
          {formatSlides.map((slide) => {
            const Icon = slide.icon;

            return (
              <article
                className={`format-slide ${slide.route ? 'is-clickable' : 'is-disabled'}`}
                key={slide.title}
                role={slide.route ? 'button' : undefined}
                tabIndex={slide.route ? 0 : -1}
                onClick={() => handleFormatSelect(slide)}
                onKeyDown={(event) => {
                  if (!slide.route) {
                    return;
                  }

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleFormatSelect(slide);
                  }
                }}
                aria-label={slide.route ? `Open ${slide.title}` : `${slide.title} coming soon`}
              >
                <span className="format-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h4>{slide.title}</h4>
                <p>{slide.description}</p>
                <div className="format-points">
                  {slide.points.map((point) => (
                    <span key={point} className="format-point">
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="carousel-footer" aria-label="Format carousel controls and indicators">
        <button className="carousel-control" onClick={handlePrevSlide} aria-label="Previous format slide">
          <svg className="carousel-control-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="carousel-dots" aria-label="Format slide indicators">
          {formatSlides.map((slide, index) => (
            <button
              key={slide.title}
              className={`carousel-dot ${activeSlide === index ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to format slide ${index + 1}`}
            />
          ))}
        </div>
        <button className="carousel-control" onClick={handleNextSlide} aria-label="Next format slide">
          <svg className="carousel-control-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default AcademyFormatsCarousel;
