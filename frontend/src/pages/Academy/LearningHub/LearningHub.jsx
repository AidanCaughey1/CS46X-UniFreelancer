import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LearningHub.css';


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
    type: [],
    duration: [],
    status: []
  });

  const [tutorialFilters, setTutorialFilters] = useState({
    topic: [],
    difficulty: [],
    length: []
  });

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
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      if (!user._id) return;

      const response = await fetch(`http://localhost:5000/api/users/${user._id}`);
      if (response.ok) {
        const userData = await response.json();
        const enrolledCount = userData.enrolledCourses ? userData.enrolledCourses.length : 0;
        const completedCount = userData.completedCourses ? userData.completedCourses.length : 0;
        const learningHours = userData.completedCourses
          ? Math.round(userData.completedCourses.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0) / 60)
          : 0;

        setStats({ enrolledCount, completedCount, learningHours });
        const enrolledIds = userData.enrolledCourses ? userData.enrolledCourses.map(c => c._id) : [];
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/academy/courses');
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
      const response = await fetch('http://localhost:5000/api/academy/seminars');
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
      const response = await fetch('http://localhost:5000/api/academy/tutorials');
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

    if (seminarFilters.type.length > 0) {
      filtered = filtered.filter(s => seminarFilters.type.includes(s.type));
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
        const watched = s.watched ? 'Watched' : 'Not Watched';
        return seminarFilters.status.includes(watched);
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
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tutorialFilters.topic.length > 0) {
      filtered = filtered.filter(t => tutorialFilters.topic.includes(t.topic));
    }

    if (tutorialFilters.difficulty.length > 0) {
      filtered = filtered.filter(t => tutorialFilters.difficulty.includes(t.difficulty));
    }

    if (tutorialFilters.length.length > 0) {
      filtered = filtered.filter(t => tutorialFilters.length.includes(t.lengthCategory));
    }

    setFilteredTutorials(filtered);
  }, [tutorials, searchTerm, tutorialFilters, activeTab]);

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
    return duration.includes('week') ? duration : `${duration} weeks`;
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

  return (
    <div className="learning-hub-page">
      <div className="learning-hub-container">
        <button className="back-link" onClick={handleBackToAcademy}>
          ← Back to Academy
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
              <span className="search-icon">🔍</span>
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
            <select className="sort-dropdown">
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
                  <option>Newest First</option>
                  <option>Most Popular</option>
                  <option>Duration: Short to Long</option>
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
                  {/* Type Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Type</h4>
                    {['Live', 'Recorded', 'Podcast'].map(type => (
                      <label key={type} className="filter-option">
                        <input
                          type="checkbox"
                          checked={seminarFilters.type.includes(type)}
                          onChange={() => handleSeminarFilterChange('type', type)}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>

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
                    {['Watched', 'Not Watched'].map(status => (
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
                    {['Design', 'Marketing', 'Development', 'Business'].map(topic => (
                      <label key={topic} className="filter-option">
                        <input
                          type="checkbox"
                          checked={tutorialFilters.topic.includes(topic)}
                          onChange={() => handleTutorialFilterChange('topic', topic)}
                        />
                        <span>{topic}</span>
                      </label>
                    ))}
                  </div>

                  {/* Difficulty Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Difficulty</h4>
                    {['Beginner', 'Intermediate', 'Advanced'].map(difficulty => (
                      <label key={difficulty} className="filter-option">
                        <input
                          type="checkbox"
                          checked={tutorialFilters.difficulty.includes(difficulty)}
                          onChange={() => handleTutorialFilterChange('difficulty', difficulty)}
                        />
                        <span>{difficulty}</span>
                      </label>
                    ))}
                  </div>

                  {/* Length Filter */}
                  <div className="filter-section">
                    <h4 className="filter-heading">Length</h4>
                    {['Short', 'Medium', 'Long'].map(length => (
                      <label key={length} className="filter-option">
                        <input
                          type="checkbox"
                          checked={tutorialFilters.length.includes(length)}
                          onChange={() => handleTutorialFilterChange('length', length)}
                        />
                        <span>{length}</span>
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
                      setSeminarFilters({ type: [], duration: [], status: [] });
                    } else if (activeTab === 'tutorials') {
                      setTutorialFilters({ topic: [], difficulty: [], length: [] });
                    }
                  }}>
                    Clear Filters
                  </button>
                </div>
              ) : (activeTab === 'courses' || activeTab === 'continue-learning') ? (
                filteredCourses.map(course => (
                  <div key={course.id || course._id} className="course-card">
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
                          <span className="detail-icon">🕐</span>
                          <span>{getCourseDuration(course.duration)}</span>
                        </div>
                        <div className="course-detail">
                          <span className="detail-icon">🏷️</span>
                          <span>{course.category || 'General'}</span>
                        </div>
                        <div className="course-detail">
                          <span className="detail-icon">📊</span>
                          <span>{course.difficulty}</span>
                        </div>
                      </div>
                      <div className="course-footer">
                        <div className="course-price">{getCoursePrice(course)}</div>
                        <button className="view-details-btn">View Details →</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : activeTab === 'seminars' ? (
                filteredSeminars.map(seminar => (
                  <div key={seminar._id} className="seminar-card">
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
                          <span className="detail-icon">🗣️</span>
                          <span>{seminar.speaker?.name || 'Unknown Speaker'}</span>
                        </div>
                        <div className="seminar-detail">
                          <span className="detail-icon">📅</span>
                          <span>{seminar.schedule?.date || 'TBD'}</span>
                        </div>
                        <div className="seminar-detail">
                          <span className="detail-icon">🎧</span>
                          <span>{seminar.type}</span>
                        </div>
                      </div>
                      <div className="seminar-footer">
                        <button className="view-details-btn">View Details →</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredTutorials.map(tutorial => (
                  <div key={tutorial._id} className="tutorial-card">
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
                          <span className="detail-icon">📚</span>
                          <span>{tutorial.topic}</span>
                        </div>
                        <div className="tutorial-detail">
                          <span className="detail-icon">🎯</span>
                          <span>{tutorial.difficulty}</span>
                        </div>
                        <div className="tutorial-detail">
                          <span className="detail-icon">⏱️</span>
                          <span>{tutorial.lengthCategory}</span>
                        </div>
                      </div>
                      <div className="tutorial-footer">
                        <button className="view-details-btn">View Tutorial →</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningHub;

