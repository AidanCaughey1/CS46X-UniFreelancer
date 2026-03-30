/* global process */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiAward, FiBarChart2 } from 'react-icons/fi';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [enrolling, setEnrolling] = useState(false);
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/academy/courses/${id}`);
        if (!response.ok) throw new Error('Course not found');
        const data = await response.json();
        setCourse(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  useEffect(() => {
    if (user && course) {
      setIsEnrolled(user.enrolledCourses?.includes(course._id));
    }
  }, [user, course]);

  const handleBack = () => navigate('/academy/courses');
  const handleContinueLearning = () => navigate(`/academy/courses/${id}/learn`);

  const handleEnroll = async () => {
    if (!course) return;
    if (!user) {
      navigate(`/login?returnTo=/academy/courses/${id}`);
      return;
    }
    try {
      setEnrolling(true);
      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment initialization failed');
      if (data.free) {
        alert("You've been enrolled in this free course!");
        setIsEnrolled(true);
        const userRes = await fetch('/api/users/me', { credentials: 'include' });
        if (userRes.ok) setUser(await userRes.json());
        return;
      }
      if (data.url) { window.location.href = data.url; return; }
      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('Enrollment failed:', err);
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const totalLessons = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-container">
          <div className="cd-loading">Loading course...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="cd-page">
        <div className="cd-container">
          <button className="cd-back-btn" onClick={handleBack}>
            <FiArrowLeft size={16} /> Back to Courses
          </button>
          <div className="cd-error">
            <h2>Course Not Found</h2>
            <p>{error || 'The course you are looking for does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-page">
      <div className="cd-container">

        <button className="cd-back-btn" onClick={handleBack}>
          <FiArrowLeft size={16} /> Back to Courses
        </button>

        <div className="cd-hero-image">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} />
          ) : (
            <div className="cd-hero-placeholder">📚</div>
          )}
        </div>

        <div className="cd-title-row">
          <h1 className="cd-title">{course.title}</h1>
          <p className="cd-description">{course.description}</p>
          <div className="cd-meta">
            <span className="cd-meta-item"><FiClock size={14} /> {course.duration || 'N/A'}</span>
            <span className="cd-meta-item"><FiAward size={14} /> {course.category || 'General'}</span>
            <span className="cd-meta-item"><FiBarChart2 size={14} /> {course.difficulty || 'Beginner'}</span>
          </div>
        </div>

        <div className="cd-body">

          <div className="cd-main">

            <div className="cd-section">
              <div className="cd-section-header">
                <h2>Course Content</h2>
                <span className="cd-lesson-count">
                  {course.modules?.length || 0} modules • {totalLessons} lessons
                </span>
              </div>

              {course.modules?.length > 0 ? (
                course.modules.map((module, index) => {
                  const key = module._id || index;
                  const isOpen = expandedModules[key];
                  const lessonCount = module.lessons?.length || 0;

                  return (
                    <div key={key} className="cd-module">
                      <div className="cd-module-header" onClick={() => toggleModule(key)}>
                        <span className="cd-module-title">
                          Module {index + 1}: {module.title}
                          {lessonCount > 0 && (
                            <span className="cd-module-lessons"> ({lessonCount} lesson{lessonCount !== 1 ? 's' : ''})</span>
                          )}
                        </span>
                        <span className="cd-module-chevron">{isOpen ? '−' : '+'}</span>
                      </div>

                      {isOpen && (
                        <div className="cd-module-content">
                          {module.description && <p>{module.description}</p>}
                          {module.lessons?.length > 0 && (
                            <ul className="cd-lessons-list">
                              {module.lessons.map((lesson, li) => (
                                <li key={lesson._id || li} className="cd-lesson-item">
                                  <span className="cd-lesson-icon">
                                    {lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '❓' : '📝'}
                                  </span>
                                  <span className="cd-lesson-title">{lesson.title}</span>
                                  {lesson.duration && (
                                    <span className="cd-lesson-duration">{lesson.duration}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="cd-empty">No modules available yet.</p>
              )}
            </div>

            <div className="cd-section cd-reviews">
              <h2>Reviews &amp; Ratings</h2>
              <div className="cd-stars-row">
                <div className="cd-stars">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="cd-star filled">★</span>
                  ))}
                </div>
                <span className="cd-rating-text">5.0 out of 5</span>
              </div>
              <p className="cd-review-count">Based on 0 reviews</p>
              <p className="cd-no-reviews">Be the first to leave a review for this course</p>
            </div>

          </div>

          <aside className="cd-sidebar">

            <div className="cd-sidebar-card">
              <div className="cd-price">
                {course.isFree ? 'Free' : `$${course.priceAmount}`}
              </div>
              {isEnrolled ? (
                <button className="cd-cta-btn" onClick={handleContinueLearning}>
                  Continue Learning
                </button>
              ) : (
                <button className="cd-cta-btn" onClick={handleEnroll} disabled={enrolling}>
                  {course.isFree
                    ? enrolling ? 'Enrolling...' : 'Enroll Free'
                    : enrolling ? 'Starting Checkout...' : `Enroll for $${course.priceAmount}`}
                </button>
              )}
            </div>

            {course.instructor && (
              <div className="cd-sidebar-card">
                <h3 className="cd-sidebar-label">Instructor</h3>
                <div className="cd-instructor">
                  <div className="cd-instructor-avatar">
                    {course.instructor.avatar ? (
                      <img src={course.instructor.avatar} alt={course.instructor.name} />
                    ) : (
                      <div className="cd-avatar-placeholder">
                        {course.instructor.name?.charAt(0) || 'I'}
                      </div>
                    )}
                  </div>
                  <div className="cd-instructor-info">
                    <div className="cd-instructor-name">{course.instructor.name}</div>
                    {course.instructor.bio && (
                      <div className="cd-instructor-bio">{course.instructor.bio}</div>
                    )}
                    {!course.instructor.bio && course.instructor.title && (
                      <div className="cd-instructor-bio">{course.instructor.title}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {course.learningPoints?.length > 0 ? (
              <div className="cd-sidebar-card">
                <h3 className="cd-sidebar-label">What You'll Learn</h3>
                <ol className="cd-learning-list">
                  {course.learningPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ol>
              </div>
            ) : course.modules?.length > 0 && (
              <div className="cd-sidebar-card">
                <h3 className="cd-sidebar-label">What You'll Learn</h3>
                <ol className="cd-learning-list">
                  {course.modules.map((m, i) => (
                    <li key={i}>{m.title}</li>
                  ))}
                </ol>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;