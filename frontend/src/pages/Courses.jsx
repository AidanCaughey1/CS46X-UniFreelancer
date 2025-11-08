import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'my-learning' or 'all'
  
  // Filter states
  const [filters, setFilters] = useState({
    level: [],
    language: [],
    duration: [],
    price: []
  });

  // Fetch courses from backend
  useEffect(() => {
    fetchCourses();
  }, []);

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

  // Handle search
  useEffect(() => {
    filterCourses();
  }, [searchTerm, filters, courses]);

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (filters.level.length > 0) {
      filtered = filtered.filter(course =>
        filters.level.includes(course.difficulty)
      );
    }

    // Duration filter
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

    // Price filter
    if (filters.price.length > 0) {
      filtered = filtered.filter(course => {
        const isFree = course.isLiteVersion || !course.priceAmount || course.priceAmount === 0;
        const price = course.priceAmount || 0;
        
        return filters.price.some(range => {
          if (range === 'free') return isFree;
          if (range === 'under-300') return price > 0 && price < 300;
          if (range === '300-600') return price >= 300 && price <= 600;
          if (range === 'over-600') return price > 600;
          return false;
        });
      });
    }

    setFilteredCourses(filtered);
  };

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
    if (course.isLiteVersion) return 'Free';
    if (!course.priceAmount || course.priceAmount === 0) return 'Free';
    return `$${course.priceAmount}`;
  };

  // Mock data for My Learning stats (will be dynamic later)
  const myLearningStats = {
    enrolled: 2,
    completed: 0,
    avgProgress: 42,
    learningHours: 5
  };

  return (
    <div className="courses-page">

      <div className="courses-container">
        {/* My Learning Section */}
        <div className="my-learning-section">
          <h2 className="section-title">My Learning</h2>
          <p className="section-subtitle">Track your progress and continue your learning journey</p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">📖</span>
              <div className="stat-content">
                <div className="stat-value">{myLearningStats.enrolled}</div>
                <div className="stat-label">Enrolled Courses</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🎓</span>
              <div className="stat-content">
                <div className="stat-value">{myLearningStats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📈</span>
              <div className="stat-content">
                <div className="stat-value">{myLearningStats.avgProgress}%</div>
                <div className="stat-label">Avg. Progress</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🕐</span>
              <div className="stat-content">
                <div className="stat-value">{myLearningStats.learningHours}</div>
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
            {/* Filters Sidebar */}
            <div className="filters-sidebar">
              <h3 className="filters-title">Filter By</h3>

              {/* Level Filter */}
              <div className="filter-section">
                <h4 className="filter-heading">Level</h4>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.level.includes('Beginner')}
                    onChange={() => handleFilterChange('level', 'Beginner')}
                  />
                  <span>Beginner</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.level.includes('Intermediate')}
                    onChange={() => handleFilterChange('level', 'Intermediate')}
                  />
                  <span>Intermediate</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.level.includes('Advanced')}
                    onChange={() => handleFilterChange('level', 'Advanced')}
                  />
                  <span>Advanced</span>
                </label>
              </div>

              {/* Duration Filter */}
              <div className="filter-section">
                <h4 className="filter-heading">Duration</h4>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.duration.includes('less-4')}
                    onChange={() => handleFilterChange('duration', 'less-4')}
                  />
                  <span>Less than 4 weeks</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.duration.includes('4-8')}
                    onChange={() => handleFilterChange('duration', '4-8')}
                  />
                  <span>4-8 weeks</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.duration.includes('8-12')}
                    onChange={() => handleFilterChange('duration', '8-12')}
                  />
                  <span>8-12 weeks</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.duration.includes('more-12')}
                    onChange={() => handleFilterChange('duration', 'more-12')}
                  />
                  <span>More than 12 weeks</span>
                </label>
              </div>

              {/* Price Filter */}
              <div className="filter-section">
                <h4 className="filter-heading">Price</h4>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.price.includes('free')}
                    onChange={() => handleFilterChange('price', 'free')}
                  />
                  <span>Free</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.price.includes('under-300')}
                    onChange={() => handleFilterChange('price', 'under-300')}
                  />
                  <span>Under $300</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.price.includes('300-600')}
                    onChange={() => handleFilterChange('price', '300-600')}
                  />
                  <span>$300 - $600</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.price.includes('over-600')}
                    onChange={() => handleFilterChange('price', 'over-600')}
                  />
                  <span>Over $600</span>
                </label>
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
                        <button className="view-details-btn">
                          View Details →
                        </button>
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
