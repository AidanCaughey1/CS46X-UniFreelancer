import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademyAudienceCards from '../../components/Academy/AcademyAudienceCards';
import AcademyBenefits from '../../components/Academy/AcademyBenefits';
import AcademyFormatsCarousel from '../../components/Academy/AcademyFormatsCarousel';
import AcademyHero from '../../components/Academy/AcademyHero';
import AcademyMarquee from '../../components/Academy/AcademyMarquee';
import AcademyPlans from '../../components/Academy/AcademyPlans';
import AcademySignals from '../../components/Academy/AcademySignals';
import AcademyTopPicksCarousel from '../../components/Academy/AcademyTopPicksCarousel';

function Academy() {
  const navigate = useNavigate();
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const handleCreateContent = () => {
    navigate('/academy/create');
  };

  const handleBrowseCourses = () => {
    navigate('/academy/courses');
  };

  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        const coursesRes = await fetch('/api/academy/courses');
        const coursesData = coursesRes.ok ? await coursesRes.json() : [];

        const pickArrayFromPayload = (payload) => {
          if (Array.isArray(payload)) {
            return payload;
          }

          if (Array.isArray(payload?.data)) {
            return payload.data;
          }

          if (Array.isArray(payload?.courses)) {
            return payload.courses;
          }

          if (Array.isArray(payload?.tutorials)) {
            return payload.tutorials;
          }

          return [];
        };

        const normalizeTitle = (value) => String(value || '').trim().toLowerCase();
        const summarizeOutcome = (value) => {
          const text = String(value || '').trim();

          if (!text) {
            return 'Practical guidance you can apply to your freelance brand right away.';
          }

          const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
          const trimmedSentence = firstSentence.length > 170
            ? `${firstSentence.slice(0, 167).trimEnd()}...`
            : firstSentence;

          return trimmedSentence;
        };

        const courses = pickArrayFromPayload(coursesData);
        const targetCourseTitles = [
          'branding yourself in freelancing',
          'catching attention with triggers and emotion for freelancers',
          'branding yourself in freelancing'
        ];

        const picks = [];

        targetCourseTitles.forEach((targetTitle, index) => {
          const course =
            courses.find((item) => normalizeTitle(item?.title) === targetTitle) ||
            courses.find((item) => normalizeTitle(item?.title).includes(targetTitle));

          if (!course) {
            return;
          }

          picks.push({
            id: `${course._id || course.id || targetTitle}-${index}`,
            type: 'course',
            label: 'Top Pick Course',
            title: course.title,
            level: course.difficulty || course.level || 'All levels',
            metaDetail: `Duration: ${course.duration || 'Self-paced'}`,
            outcome: summarizeOutcome(course.description),
            accent: 'Warm',
            image:
              course.thumbnail ||
              course.thumbnailUrl ||
              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
            imageAlt: `${course.title} course cover`
          });
        });

        setFeaturedTracks(picks);
      } catch (error) {
        console.error('Error loading top picks:', error);
        setFeaturedTracks([]);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchTopPicks();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-main-bg px-6 pb-24 pt-20 font-academy">
      <div className="hidden">
        <span className="absolute left-[-8vw] top-[-24vh] h-[120vh] min-w-[260px] w-[42vw] rotate-[16deg] bg-[linear-gradient(180deg,rgba(244,102,62,0),rgba(244,102,62,0.06),rgba(244,102,62,0))] opacity-[0.18] blur-[2px] animate-beam-sweep-left" />
        <span className="absolute right-[-10vw] top-[-22vh] h-[120vh] min-w-[260px] w-[42vw] -rotate-[14deg] bg-[linear-gradient(180deg,rgba(243,245,248,0),rgba(243,245,248,0.3),rgba(243,245,248,0))] opacity-[0.18] blur-[2px] animate-beam-sweep-right" />
      </div>
      <div className="relative z-[3] mx-auto max-w-academy">
        <AcademyHero
          onBrowseCourses={handleBrowseCourses}
          onCreateContent={handleCreateContent}
        />
        <AcademySignals />
        <AcademyFormatsCarousel />
        <AcademyMarquee />
        <AcademyAudienceCards
          onBrowseCourses={handleBrowseCourses}
          onCreateContent={handleCreateContent}
        />
        <AcademyTopPicksCarousel
          featuredLoading={featuredLoading}
          featuredTracks={featuredTracks}
        />
        <AcademyPlans />
        <AcademyBenefits />
        <p className="mt-4 text-right text-xs text-dark-secondary/65">Photography sourced from Unsplash.</p>
      </div>
    </div>
  );
}

export default Academy;
