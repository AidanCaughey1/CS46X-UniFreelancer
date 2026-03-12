import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBookOpen,
  FiTag,
  FiBarChart2,
  FiMic,
  FiCalendar,
  FiHeadphones,
  FiClock,
  FiSearch
} from 'react-icons/fi';
import './LearningHub.css';
import { getSeminarLocalScheduleLabel, getSeminarStatus } from '../../../utils/seminarStatus';


function LearningHub() {
  const location = useLocation();
  const navigate = useNavigate();
  // Set default tab based on URL
  const getInitialTab = () => {
    if (location.pathname === '/academy/seminars') return 'seminars';
    if (location.pathname === '/academy/tutorials') return 'tutorials';
    return 'courses';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab()); // 'continue-learning', 'courses', 'seminars', 'tutorials'
  const [courses, setCourses] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredSeminars, setFilteredSeminars] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    learningHours: 0
  });

  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const [courseFilters, setCourseFilters] = useState({
    level: [],
    language: [],
    duration: [],
    price: []
  });

  const [seminarFilters, setSeminarFilters] = useState({
    duration: [],
    status: []
  });

  const [tutorialFilters, setTutorialFilters] = useState({
    type: [],
    topic: [],
    duration: []
  });

  const [tutorialSort, setTutorialSort] = useState("newest");
  const [showAllTutorialTopics, setShowAllTutorialTopics] = useState(false);

  const tutorialTopicOptions = useMemo(() => {
    const counts = new Map();
    tutorials.forEach((tutorial) => {
      const topic = tutorial?.category || "General";
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([topic]) => topic);
  }, [tutorials]);

  const tutorialTopicsToShow = showAllTutorialTopics
    ? tutorialTopicOptions
    : tutorialTopicOptions.slice(0, 5);

  const formatTutorialDuration = (duration) => {
    if (!duration) return "Self-paced";
    const normalized = String(duration).trim();
    return /^\d+$/.test(normalized) ? `${normalized} Minutes` : normalized;
  };

  const parseDurationMinutes = (duration) => {
    if (!duration || typeof duration !== "string") return 0;
    const normalized = duration.toLowerCase().trim();
    const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
    if (!numberMatch) return 0;
    const value = Number(numberMatch[1]);
    if (Number.isNaN(value)) return 0;
    if (normalized.includes("hour")) return Math.round(value * 60);
    if (normalized.includes("min")) return Math.round(value);
    return Math.round(value);
  };

  // Update tab when URL changes
  useEffect(() => {
    const newTab = location.pathname === '/academy/seminars' ? 'seminars' :
      location.pathname === '/academy/tutorials' ? 'tutorials' :
        'courses';
    setActiveTab(newTab);
  }, [location.pathname]);

  // Fetch data
  useEffect(() => {
    fetchCourses();
    fetchSeminars();
    fetchTutorials();
    fetchStats();
  }, []);

  const fetchStats = async () => {
  try {
    const response = await fetch(`/api/users/me`, {
      credentials: 'include'
    });

    if (!response.ok) return;

    const userData = await response.json();

    const enrolledCount = userData.enrolledCourses?.length ?? 0;
    const completedCount = userData.completedCourses?.length ?? 0;
    const totalSeconds = Number(userData.learning?.totalSeconds ?? 0);
    const learningHours = Math.floor(totalSeconds / 3600); 

    setStats({ enrolledCount, completedCount, learningHours });
    setEnrolledCourseIds(userData.enrolledCourses ?? []);
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/academy/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeminars = async () => {
    try {
      const response = await fetch('/api/academy/seminars');
      if (response.ok) {
        const data = await response.json();
        setSeminars(data);
        setFilteredSeminars(data);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    }
  };

  const fetchTutorials = async () => {
    try {
      const response = await fetch('/api/academy/tutorials');
      if (response.ok) {
        const data = await response.json();
        setTutorials(data);
        setFilteredTutorials(data);
      }
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    }
  };

  // Filter courses
  const filterCourses = useCallback(() => {
    let filtered = [...courses];

    if (activeTab === 'continue-learning') {
      filtered = filtered.filter(course => enrolledCourseIds.includes(course._id));
    }

    if (searchTerm && (activeTab === 'courses' || activeTab === 'continue-learning')) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (courseFilters.level.length > 0) {
      filtered = filtered.filter(course => courseFilters.level.includes(course.difficulty));
    }

    if (courseFilters.duration.length > 0) {
      filtered = filtered.filter(course => {
        const weeks = parseInt(course.duration);
        return courseFilters.duration.some(range => {
          if (range === 'less-4') return weeks < 4;
          if (range === '4-8') return weeks >= 4 && weeks <= 8;
          if (range === '8-12') return weeks > 8 && weeks <= 12;
          if (range === 'more-12') return weeks > 12;
          return false;
        });
      });
    }

    if (courseFilters.price.length > 0) {
      filtered = filtered.filter(course => {
        const isFree = course.isLiteVersion || !course.priceAmount || course.priceAmount === 0;
        const price = course.priceAmount || 0;
        return courseFilters.price.some(range => {
          if (range === 'free') return isFree;
          if (range === 'under-300') return price > 0 && price < 300;
          if (range === '300-600') return price >= 300 && price <= 600;
          if (range === 'over-600') return price > 600;
          return false;
        });
      });
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, courseFilters, activeTab, enrolledCourseIds]);

  // Filter seminars
  const filterSeminars = useCallback(() => {
    let filtered = [...seminars];

    if (searchTerm && activeTab === 'seminars') {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.speaker?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (seminarFilters.duration.length > 0) {
      filtered = filtered.filter(s => {
        const mins = parseInt(s.duration) || 0;
        return seminarFilters.duration.some(range => {
          if (range === 'less-60') return mins < 60;
          if (range === '60-90') return mins >= 60 && mins <= 90;
          if (range === 'more-90') return mins > 90;
          return false;
        });
      });
    }

    if (seminarFilters.status.length > 0) {
      filtered = filtered.filter(s => {
        const status = getSeminarStatus(s);
        return seminarFilters.status.includes(status);
      });
    }

    setFilteredSeminars(filtered);
  }, [seminars, searchTerm, seminarFilters, activeTab]);

  // Filter tutorials
  const filterTutorials = useCallback(() => {
    let filtered = [...tutorials];

    if (searchTerm && activeTab === 'tutorials') {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tutorialFilters.type.length > 0) {
      filtered = filtered.filter(t => {
        const types = [];
        if (t.videoUrl) types.push("Video");
        if (t.writtenContent) types.push("Article");
        return tutorialFilters.type.some(type => types.includes(type));
      });
    }

    if (tutorialFilters.topic.length > 0) {
      filtered = filtered.filter(t =>
        tutorialFilters.topic.includes(t.category || "General")
      );
    }

    if (tutorialFilters.duration.length > 0) {
      filtered = filtered.filter(t => {
        const minutes = parseDurationMinutes(t.duration);
        if (!minutes) return false;

        return tutorialFilters.duration.some(range => {
          if (range === '0-15') return minutes > 0 && minutes <= 15;
          if (range === '15-30') return minutes > 15 && minutes <= 30;
          if (range === '30-45') return minutes > 30 && minutes <= 45;
          if (range === '45-60') return minutes > 45 && minutes <= 60;
          if (range === '60+') return minutes > 60;
          return false;
        });
      });
    }

    filtered.sort((a, b) => {
      if (tutorialSort === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (tutorialSort === "duration-asc") {
        return parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration);
      }
      if (tutorialSort === "duration-desc") {
        return parseDurationMinutes(b.duration) - parseDurationMinutes(a.duration);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    setFilteredTutorials(filtered);
  }, [tutorials, searchTerm, tutorialFilters, activeTab, tutorialSort]);

  useEffect(() => {
    if (activeTab === 'courses' || activeTab === 'continue-learning') {
      filterCourses();
    } else if (activeTab === 'seminars') {
      filterSeminars();
    } else if (activeTab === 'tutorials') {
      filterTutorials();
    }
  }, [filterCourses, filterSeminars, filterTutorials, activeTab]);

  const handleCourseFilterChange = (category, value) => {
    setCourseFilters(prev => {
      const currentFilters = prev[category];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value];
      return { ...prev, [category]: newFilters };
    });
  };

  const handleSeminarFilterChange = (category, value) => {
    setSeminarFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleTutorialFilterChange = (category, value) => {
    setTutorialFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const getCourseDuration = (duration) => {
    if (!duration) return 'Self-paced';
    const text = String(duration).trim();
    if (!text) return 'Self-paced';
    if (!text.toLowerCase().includes('week')) {
      return `${text} weeks`;
    }

    return text.replace(/week(s)?/ig, (match) =>
      match.toLowerCase().startsWith('week')
        ? (match.toLowerCase().endsWith('s') ? 'Weeks' : 'Week')
        : match
    );
  };

  const getCoursePrice = (course) => {
    if (course.subscription && (course.subscription.isSubscriptionCourse === true || course.subscription.isSubscriptionCourse === 'true')) {
      return 'Included in subscription';
    }
    const amountFromPricing = typeof course.pricing?.amount === 'number' ? course.pricing.amount : undefined;
    const amount = amountFromPricing ?? Number(course.priceAmount || 0);
    if (amount > 0) return `$${amount}`;
    if (course.isLiteVersion) return 'Free';
    return 'Free';
  };

  const handleBackToAcademy = () => {
    navigate('/academy');
  };

  const handleViewSeminar = (seminarId) => {
    navigate(`/academy/seminars/${seminarId}`);
  };

  return (
    <div className="learning-hub-page">
      <div className="learning-hub-container">
        <button className="back-link" onClick={handleBackToAcademy}>
          <FiArrowLeft size={18} /> Back to Academy
        </button>

        {/* My Learning Section */}
        <div className="my-learning-section">
          <h2 className="section-title">My Learning</h2>
          <p className="section-subtitle">Track your progress and continue your learning journey</p>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">📖</span>
              <div className="stat-content">
                <div className="stat-value">{stats.enrolledCount}</div>
                <div className="stat-label">Enrolled Courses</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🎓</span>
              <div className="stat-content">
                <div className="stat-value">{stats.completedCount}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🕐</span>
              <div className="stat-content">
                <div className="stat-value">{stats.learningHours}</div>
                <div className="stat-label">Learning Hours</div>
              </div>
            </div>
          </div>

          <div className="learning-tabs">
            <button
              className={`tab ${activeTab === 'continue-learning' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('continue-learning');
                setSearchTerm('');
                navigate('/academy/courses');
              }}
            >
              Continue Learning
            </button>
            <button
              className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('courses');
                setSearchTerm('');
                navigate('/academy/courses');
              }}
            >
              Courses
            </button>
            <button
              className={`tab ${activeTab === 'seminars' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('seminars');
                setSearchTerm('');
                navigate('/academy/seminars');
              }}
            >
              Seminars
            </button>
            <button
              className={`tab ${activeTab === 'tutorials' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('tutorials');
                setSearchTerm('');
                navigate('/academy/tutorials');
              }}
            >
              Tutorials
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-section">
          <h2 className="section-title">
            {activeTab === 'continue-learning' ? 'Continue Learning' :
              activeTab === 'courses' ? 'Courses' :
                activeTab === 'seminars' ? 'Seminars & Events' :
                  'Tutorials'}
          </h2>
          <p className="section-subtitle">
            {activeTab === 'continue-learning' ? 'Continue your learning journey with enrolled courses' :
              activeTab === 'courses' ? 'Structured learning programs to master freelancing disciplines' :
                activeTab === 'seminars' ? 'Interactive live sessions and expert workshops' :
                  'Quick, focused lessons to learn specific skills'}
          </p>

          <div className="search-bar-container">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={
                  activeTab === 'continue-learning' || activeTab === 'courses' ? 'Search courses...' :
                    activeTab === 'seminars' ? 'Search seminars...' :
                      'Search tutorials...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="sort-dropdown"
              value={activeTab === 'tutorials' ? tutorialSort : undefined}
              onChange={(event) => {
                if (activeTab === 'tutorials') {
                  setTutorialSort(event.target.value);
                }
              }}
            >
              {activeTab === 'continue-learning' || activeTab === 'courses' ? (
                <>
                  <option>All Courses</option>
                  <option>Most Popular</option>
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </>
              ) : activeTab === 'seminars' ? (
                <>
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Live Sessions</option>
                </>
              ) : (
                <>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="duration-asc">Duration: Short to Long</option>
                  <option value="duration-desc">Duration: Long to Short</option>
                </>
              )}
            </select>
          </div>

          <div className="content-area">
            {/* Filters Sidebar */}
            <div className="filters-sidebar">
              <h3 className="filters-title">Filter By</h3>

              {(activeTab === 'courses' || activeTab === 'continue-learning') ? (
                <>
                  {/* Level Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Level</h4>
                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                      <label key={level} className="filter-option">
                        <input
                          type="checkbox"
                          checked={courseFilters.level.includes(level)}
                          onChange={() => handleCourseFilterChange('level', level)}
                        />
                        <span>{level}</span>
                      </label>
                    ))}
                  </div>

                  {/* Duration Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Duration</h4>
                    {['less-4', '4-8', '8-12', 'more-12'].map(range => (
                      <label key={range} className="filter-option">
                        <input
                          type="checkbox"
                          checked={courseFilters.duration.includes(range)}
                          onChange={() => handleCourseFilterChange('duration', range)}
                        />
                        <span>
                          {range === 'less-4' ? 'Less than 4 weeks' :
                            range === '4-8' ? '4-8 weeks' :
                              range === '8-12' ? '8-12 weeks' :
                                'More than 12 weeks'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Price Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Price</h4>
                    {['free', 'under-300', '300-600', 'over-600'].map(range => (
                      <label key={range} className="filter-option">
                        <input
                          type="checkbox"
                          checked={courseFilters.price.includes(range)}
                          onChange={() => handleCourseFilterChange('price', range)}
                        />
                        <span>
                          {range === 'free' ? 'Free' :
                            range === 'under-300' ? 'Under $300' :
                              range === '300-600' ? '$300 - $600' :
                                'Over $600'}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              ) : activeTab === 'seminars' ? (
                <>
                  {/* Duration Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Duration</h4>
                    {['less-60', '60-90', 'more-90'].map(range => (
                      <label key={range} className="filter-option">
                        <input
                          type="checkbox"
                          checked={seminarFilters.duration.includes(range)}
                          onChange={() => handleSeminarFilterChange('duration', range)}
                        />
                        <span>
                          {range === 'less-60' ? 'Less than 60 min' :
                            range === '60-90' ? '60–90 min' :
                              'More than 90 min'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Status</h4>
                    {['Future', 'Live Now', 'Past'].map(status => (
                      <label key={status} className="filter-option">
                        <input
                          type="checkbox"
                          checked={seminarFilters.status.includes(status)}
                          onChange={() => handleSeminarFilterChange('status', status)}
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <>
                   {/* Topic Filter */}
                   <div className="filter-section">
                     <h4 className="filter-heading">Topic</h4>
                     {tutorialTopicsToShow.length === 0 ? (
                       <p className="filter-empty">No topics available.</p>
                     ) : (
                       tutorialTopicsToShow.map(topic => (
                         <label key={topic} className="filter-option">
                           <input
                             type="checkbox"
                             checked={tutorialFilters.topic.includes(topic)}
                             onChange={() => handleTutorialFilterChange('topic', topic)}
                           />
                           <span>{topic}</span>
                         </label>
                       ))
                     )}

                     {tutorialTopicOptions.length > 5 && (
                       <button
                         type="button"
                         className="topic-toggle"
                         onClick={() => setShowAllTutorialTopics((prev) => !prev)}
                       >
                         {showAllTutorialTopics ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>

                   {/* Type Filter */}
                   <div className="filter-section">
                     <h4 className="filter-heading">Type</h4>
                     {['Article', 'Video'].map(type => (
                       <label key={type} className="filter-option">
                         <input
                           type="checkbox"
                           checked={tutorialFilters.type.includes(type)}
                           onChange={() => handleTutorialFilterChange('type', type)}
                         />
                         <span>{type}</span>
                       </label>
                     ))}
                   </div>

                   {/* Duration Filter */}
                   <div className="filter-section">
                     <h4 className="filter-heading">Duration</h4>
                     {['0-15', '15-30', '30-45', '45-60', '60+'].map(range => (
                       <label key={range} className="filter-option">
                         <input
                           type="checkbox"
                           checked={tutorialFilters.duration.includes(range)}
                           onChange={() => handleTutorialFilterChange('duration', range)}
                         />
                        <span>
                          {range === '0-15' ? '0-15 Minutes' :
                            range === '15-30' ? '15-30 Minutes' :
                              range === '30-45' ? '30-45 Minutes' :
                                range === '45-60' ? '45-60 Minutes' :
                                  'Over 60 Minutes'}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content Grid */}
            <div className="content-grid">
              {loading ? (
                <div className="loading-message">
                  Loading {activeTab === 'courses' || activeTab === 'continue-learning' ? 'courses' : activeTab === 'seminars' ? 'seminars' : 'tutorials'}...
                </div>
              ) : (activeTab === 'courses' || activeTab === 'continue-learning' ? filteredCourses : activeTab === 'seminars' ? filteredSeminars : activeTab === 'tutorials' ? filteredTutorials : []).length === 0 ? (
                <div className="no-results">
                  <p>No {activeTab === 'courses' || activeTab === 'continue-learning' ? 'courses' : activeTab === 'seminars' ? 'seminars' : 'tutorials'} found matching your criteria.</p>
                  <button onClick={() => {
                    setSearchTerm('');
                    if (activeTab === 'courses' || activeTab === 'continue-learning') {
                      setCourseFilters({ level: [], language: [], duration: [], price: [] });
                    } else if (activeTab === 'seminars') {
                      setSeminarFilters({ duration: [], status: [] });
                    } else if (activeTab === 'tutorials') {
                      setTutorialFilters({ type: [], topic: [], duration: [] });
                    }
                  }}>
                    Clear Filters
                  </button>
                </div>
              ) : (activeTab === 'courses' || activeTab === 'continue-learning') ? (
                filteredCourses.map(course => (
                  <div
                    key={course.id || course._id}
                    className="course-card"
                    onClick={() => navigate(`/academy/courses/${course._id || course.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="course-image">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} />
                      ) : (
                        <div className="placeholder-image">📚</div>
                      )}
                    </div>
                    <div className="course-content">
                      <div className="course-header">
                        <h3 className="course-title">{course.title}</h3>
                        {course.isLiteVersion && <span className="lite-badge">Lite</span>}
                      </div>
                      <p className="course-description">
                        {course.description?.substring(0, 80)}...
                      </p>
                      <div className="course-details">
                        <div className="course-detail">
                          <FiClock className="detail-icon" />
                          <span>{getCourseDuration(course.duration)}</span>
                        </div>
                        <div className="course-detail">
                          <FiTag className="detail-icon" />
                          <span>{course.category || 'General'}</span>
                        </div>
                        <div className="course-detail">
                          <FiBarChart2 className="detail-icon" />
                          <span>{course.difficulty}</span>
                        </div>
                      </div>
                      <div className="course-footer">
                        <div className="course-price">{getCoursePrice(course)}</div>
                        <button
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/academy/courses/${course._id || course.id}`);
                          }}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : activeTab === 'seminars' ? (
                filteredSeminars.map(seminar => (
                  <div
                    key={seminar._id}
                    className="seminar-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleViewSeminar(seminar._id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleViewSeminar(seminar._id);
                      }
                    }}
                  >
                    <div className="seminar-image">
                      {seminar.thumbnail ? (
                        <img src={seminar.thumbnail} alt={seminar.title} />
                      ) : (
                        <div className="placeholder-image">🎤</div>
                      )}
                    </div>
                    <div className="seminar-content">
                      <h3 className="seminar-title">{seminar.title}</h3>
                      <p className="seminar-description">
                        {seminar.description?.substring(0, 80)}...
                      </p>
                      <div className="seminar-details">
                        <div className="seminar-detail">
                          <FiMic className="detail-icon" />
                          <span>{seminar.speaker?.name || 'Unknown Speaker'}</span>
                        </div>
                        <div className="seminar-detail">
                          <FiCalendar className="detail-icon" />
                          <span>{getSeminarLocalScheduleLabel(seminar)}</span>
                        </div>
                        <div className="seminar-detail">
                          <FiHeadphones className="detail-icon" />
                          <span>{getSeminarStatus(seminar)}</span>
                        </div>
                      </div>
                      <div className="seminar-footer">
                        <button
                          className="view-details-btn"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleViewSeminar(seminar._id);
                          }}
                          title='View seminar details'
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredTutorials.map((tutorial) => {
                  const tutorialId = tutorial._id || tutorial.id;
                  const goToTutorial = () => {
                    if (!tutorialId) return;
                    navigate(`/academy/tutorials/${tutorialId}`);
                  };

                  return (
                    <div
                      key={tutorialId || tutorial.title}
                      className="tutorial-card"
                      onClick={goToTutorial}
                      style={{ cursor: tutorialId ? "pointer" : "default" }}
                    >
                      <div className="tutorial-image">
                        {tutorial.thumbnail ? (
                          <img src={tutorial.thumbnail} alt={tutorial.title} />
                        ) : (
                          <div className="placeholder-image">📘</div>
                        )}
                      </div>
                      <div className="tutorial-content">
                        <h3 className="tutorial-title">{tutorial.title}</h3>
                        <p className="tutorial-description">
                          {tutorial.description?.substring(0, 90)}...
                        </p>
                        <div className="tutorial-details">
                        <div className="tutorial-detail">
                          <FiBookOpen className="detail-icon" />
                          <span>{tutorial.category || 'General'}</span>
                        </div>
                        <div className="tutorial-detail">
                          <FiClock className="detail-icon" />
                          <span>{formatTutorialDuration(tutorial.duration)}</span>
                        </div>
                        </div>
                        <div className="tutorial-footer">
                          <button
                            className="view-details-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToTutorial();
                            }}
                          >
                            View Tutorial →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningHub;
