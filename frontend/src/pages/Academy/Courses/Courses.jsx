import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import './Courses.css';
import AcademySubnav from '../../../components/AcademySubnav';

function Courses() {
  // const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'my-learning' or 'all'

  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    learningHours: 0
  });

  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const [filters, setFilters] = useState({
    level: [],
    language: [],
    duration: [],
    price: []
  });

  // Fetch courses and stats from backend
  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      if (!user._id) return;

      // Fetch user details including enrolled courses
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/academy/courses`);
      if (response.ok) {
        const userData = await response.json();

        // Calculate stats
        const enrolledCount = userData.enrolledCourses ? userData.enrolledCourses.length : 0;
        const completedCount = userData.completedCourses ? userData.completedCourses.length : 0;
        const learningHours = userData.completedCourses
          ? Math.round(userData.completedCourses.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0) / 60)
          : 0;

        setStats({ enrolledCount, completedCount, learningHours });

        // Set enrolled course IDs for filtering
        const enrolledIds = userData.enrolledCourses ? userData.enrolledCourses.map(c => c._id) : [];
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/academy/seminars`);
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

  // Wrap filterCourses in useCallback
  const filterCourses = useCallback(() => {
    let filtered = [...courses];

    // Filter by Active Tab (My Learning)
    if (activeTab === 'my-learning') {
      filtered = filtered.filter(course => enrolledCourseIds.includes(course._id));
    }

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.level.length > 0) {
      filtered = filtered.filter(course => filters.level.includes(course.difficulty));
    }

    if (filters.duration.length > 0) {
      filtered = filtered.filter(course => {
        const weeks = parseInt(course.duration);
        return filters.duration.some(range => {
          if (range === 'less-4') return weeks < 4;
          if (range === '4-8') return weeks >= 4 && weeks <= 8;
          if (range === '8-12') return weeks > 8 && weeks <= 12;
          if (range === 'more-12') return weeks > 12;
          return false;
        });
      });
    }

    if (filters.price.length > 0) {
      filtered = filtered.filter(course => {
        const price = Number(course.priceAmount ?? 0);
        const isFree =
          course.isFree === true ||
          course.isLiteVersion === true ||
          !price ||
          price === 0;

        return filters.price.some(range => {
          if (range === "free") return isFree;

          if (range === "under-300") {
            // Include free + anything under $300
            return price >= 0 && price < 300;
          }

          if (range === "300-600") return price >= 300 && price <= 600;
          if (range === "over-600") return price > 600;

          return false;
        });
      });
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, filters, activeTab, enrolledCourseIds]);

  // Call filterCourses whenever dependencies change
  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const currentFilters = prev[category];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value];

      return { ...prev, [category]: newFilters };
    });
  };

  const getCourseDuration = (duration) => {
    if (!duration) return 'Self-paced';
    return duration.includes('week') ? duration : `${duration} weeks`;
  };

  const getCoursePrice = (course) => {
    if (
      course.subscription &&
      (course.subscription.isSubscriptionCourse === true ||
        course.subscription.isSubscriptionCourse === "true")
    ) {
      return "Included in subscription";
    }

    const price = Number(course.priceAmount ?? 0);

    if (price > 0) return `$${price}`;
    if (course.isLiteVersion || course.isFree) return "Free";

    return "Free";
  };

  return (
    <div className="courses-page">
      <div className="courses-container">
        {/* My Learning Section */}
        <AcademySubnav />
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
              className={`tab ${activeTab === 'my-learning' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-learning')}
            >
              My Learning
            </button>
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Courses
            </button>
          </div>
        </div>
        {/* Courses Section */}
        <div className="courses-section">
          <h2 className="section-title">Courses</h2>
          <p className="section-subtitle">Structured learning programs to master freelancing disciplines</p>
          <div className="search-bar-container">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="sort-dropdown">
              <option>All Courses</option>
              <option>Most Popular</option>
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="courses-content">
            <div className="filters-sidebar">
              <h3 className="filters-title">Filter By</h3>

              {/* Level Filter */}
              <div className="filter-section">
                <h4 className="filter-heading">Level</h4>
                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <label key={level} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.level.includes(level)}
                      onChange={() => handleFilterChange('level', level)}
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
                      checked={filters.duration.includes(range)}
                      onChange={() => handleFilterChange('duration', range)}
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
                      checked={filters.price.includes(range)}
                      onChange={() => handleFilterChange('price', range)}
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
            </div>

            {/* Course Cards Grid */}
            <div className="courses-grid">
              {loading ? (
                <div className="loading-message">Loading courses...</div>
              ) : filteredCourses.length === 0 ? (
                <div className="no-results">
                  <p>No courses found matching your criteria.</p>
                  <button onClick={() => {
                    setSearchTerm('');
                    setFilters({ level: [], language: [], duration: [], price: [] });
                  }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredCourses.map(course => (
                  <div key={course.id} className="course-card">
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
                      <p className="course-description">{course.description?.substring(0, 80)}...</p>
                      <div className="course-details">
                        <div className="course-detail"><span className="detail-icon">🕐</span><span>{getCourseDuration(course.duration)}</span></div>
                        <div className="course-detail"><span className="detail-icon">🏷️</span><span>{course.category || 'General'}</span></div>
                        <div className="course-detail"><span className="detail-icon">📊</span><span>{course.difficulty}</span></div>
                      </div>
                      <div className="course-footer">
                        <div className="course-price">{getCoursePrice(course)}</div>
                        <button className="view-details-btn">View Details →</button>
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

export default Courses;