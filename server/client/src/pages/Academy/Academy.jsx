/* global process */
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
import './Academy.css';

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
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const coursesRes = await fetch(`${apiUrl}/api/academy/courses`);
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
    <div className="academy-page">
      <div className="academy-ambient">
        <span className="ambient-beam beam-one" />
        <span className="ambient-beam beam-two" />
      </div>
      <div className="academy-container">
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
        <p className="academy-image-credit">Photography sourced from Unsplash.</p>
      </div>
    </div>
  );
}

export default Academy;
