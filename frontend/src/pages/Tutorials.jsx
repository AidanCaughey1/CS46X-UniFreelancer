import React, { useState, useEffect, useCallback } from 'react';
import './Tutorials.css';
import AcademySubnav from '../components/AcademySubnav';

function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'my-learning' | 'all'

  const [filters, setFilters] = useState({
    category: [],
    duration: [],
    status: [],
  });

  // Fetch tutorials from backend
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/academy/tutorials'
        );
        if (response.ok) {
          const data = await response.json();
          setTutorials(data);
          setFilteredTutorials(data);
        } else {
          console.warn('Tutorials endpoint not ready yet, using empty list');
          setTutorials([]);
          setFilteredTutorials([]);
        }
      } catch (error) {
        console.error('Error fetching tutorials:', error);
        setTutorials([]);
        setFilteredTutorials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      return { ...prev, [category]: updated };
    });
  };

  const getDurationInMinutes = (tutorial) => {
    if (typeof tutorial.estimatedMinutes === 'number') {
      return tutorial.estimatedMinutes;
    }

    if (typeof tutorial.estimatedTime === 'string') {
      // e.g. "45 min", "30 minutes"
      const match = tutorial.estimatedTime.match(/(\d+)\s*min/);
      if (match) return parseInt(match[1], 10);
    }

    if (typeof tutorial.duration === 'string') {
      const match = tutorial.duration.match(/(\d+)\s*min/);
      if (match) return parseInt(match[1], 10);
    }

    return null; // unknown
  };

  const getDurationLabel = (tutorial) => {
    const mins = getDurationInMinutes(tutorial);
    if (!mins) return 'Self-paced';

    if (mins < 30) return `${mins} min • Quick`;
    if (mins <= 60) return `${mins} min • ~ 1 hour`;
    if (mins <= 120) return `${mins} min • Deep dive`;

    return `${mins} min • Extended`;
  };

  const getResourceLabel = (tutorial) => {
    const count =
      typeof tutorial.resourceCount === 'number'
        ? tutorial.resourceCount
        : Array.isArray(tutorial.resources)
        ? tutorial.resources.length
        : 0;

    if (count === 0) return 'No extra resources';
    if (count === 1) return '1 resource';
    return `${count} resources`;
  };

  const getStatus = (tutorial) => {
    // default everything to "not-started" for now
    return tutorial.status || 'not-started';
  };

  // Main filter logic
  const filterTutorials = useCallback(() => {
    let filtered = [...tutorials];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title?.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term) ||
          t.category?.toLowerCase().includes(term)
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter((t) =>
        filters.category.includes(t.category)
      );
    }

    if (filters.duration.length > 0) {
      filtered = filtered.filter((t) => {
        const mins = getDurationInMinutes(t);
        if (!mins) return false; // if duration unknown, don't include when filtering

        return filters.duration.some((range) => {
          if (range === 'under-30') return mins < 30;
          if (range === '30-60') return mins >= 30 && mins <= 60;
          if (range === '60-120') return mins > 60 && mins <= 120;
          if (range === 'over-120') return mins > 120;
          return false;
        });
      });
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter((t) =>
        filters.status.includes(getStatus(t))
      );
    }

    setFilteredTutorials(filtered);
  }, [tutorials, searchTerm, filters]);

  useEffect(() => {
    filterTutorials();
  }, [filterTutorials]);

  // Build category options dynamically from data
  const categoryOptions = Array.from(
    new Set(
      tutorials
        .map((t) => t.category)
        .filter((c) => typeof c === 'string' && c.trim().length > 0)
    )
  );

  const myLearningStats = {
    enrolled: 4,
    completed: 1,
    avgProgress: 68,
    learningHours: 3,
  };

  return (
    <div className="courses-page">
      <div className="courses-container">
        <AcademySubnav />

        {/* My Learning section reused */}
        <div className="my-learning-section">
          <h2 className="section-title">My Tutorials</h2>
          <p className="section-subtitle">
            Quick, focused lessons to help you learn on the go.
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">📚</span>
              <div className="stat-content">
                <div className="stat-value">{myLearningStats.enrolled}</div>
                <div className="stat-label">Saved Tutorials</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-content">
                <div className="stat-value">{myLearningStats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📈</span>
              <div className="stat-content">
                <div className="stat-value">
                  {myLearningStats.avgProgress}%
                </div>
                <div className="stat-label">Avg. Progress</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🕐</span>
              <div className="stat-content">
                <div className="stat-value">
                  {myLearningStats.learningHours}
                </div>
                <div className="stat-label">Learning Hours</div>
              </div>
            </div>
          </div>

          <div className="learning-tabs">
            <button
              className={`tab ${
                activeTab === 'my-learning' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('my-learning')}
            >
              My Learning
            </button>
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Tutorials
            </button>
          </div>
        </div>

        {/* Tutorials list */}
        <div className="courses-section">
          <h2 className="section-title">Tutorials</h2>
          <p className="section-subtitle">
            Short, practical guides to learn specific tools and workflows.
          </p>

          <div className="search-bar-container">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="sort-dropdown">
              <option>All Tutorials</option>
              <option>Newest First</option>
              <option>Shortest First</option>
              <option>Longest First</option>
            </select>
          </div>

          <div className="courses-content">
            {/* Filters */}
            <div className="filters-sidebar">
              <h3 className="filters-title">Filter By</h3>

              {/* Category */}
              <div className="filter-section">
                <h4 className="filter-heading">Category</h4>
                {categoryOptions.length === 0 ? (
                  <p className="filter-empty">No categories yet</p>
                ) : (
                  categoryOptions.map((category) => (
                    <label key={category} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={() =>
                          handleFilterChange('category', category)
                        }
                      />
                      <span>{category}</span>
                    </label>
                  ))
                )}
              </div>

              {/* Duration */}
              <div className="filter-section">
                <h4 className="filter-heading">Duration</h4>
                {[
                  'under-30',
                  '30-60',
                  '60-120',
                  'over-120',
                ].map((range) => (
                  <label key={range} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.duration.includes(range)}
                      onChange={() =>
                        handleFilterChange('duration', range)
                      }
                    />
                    <span>
                      {range === 'under-30'
                        ? 'Under 30 minutes'
                        : range === '30-60'
                        ? '30–60 minutes'
                        : range === '60-120'
                        ? '60–120 minutes'
                        : 'Over 2 hours'}
                    </span>
                  </label>
                ))}
              </div>

              {/* Status */}
              <div className="filter-section">
                <h4 className="filter-heading">Status</h4>
                {[
                  { value: 'not-started', label: 'Not started' },
                  { value: 'completed', label: 'Completed' },
                ].map((s) => (
                  <label key={s.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(s.value)}
                      onChange={() =>
                        handleFilterChange('status', s.value)
                      }
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tutorials cards */}
            <div className="courses-grid">
              {loading ? (
                <div className="loading-message">Loading tutorials...</div>
              ) : filteredTutorials.length === 0 ? (
                <div className="no-results">
                  <p>No tutorials found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        category: [],
                        duration: [],
                        status: [],
                      });
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredTutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="course-card tutorial-card"
                  >
                    <div className="course-image">
                      {tutorial.thumbnail ? (
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                        />
                      ) : (
                        <div className="placeholder-image">🎯</div>
                      )}

                      {tutorial.category && (
                        <div className="tutorial-category-pill">
                          {tutorial.category}
                        </div>
                      )}
                    </div>

                    <div className="course-content">
                      <div className="course-header">
                        <h3 className="course-title">
                          {tutorial.title}
                        </h3>
                      </div>

                      <p className="course-description">
                        {tutorial.description
                          ? `${tutorial.description.substring(
                              0,
                              80
                            )}…`
                          : 'Quick, focused tutorial.'}
                      </p>
                      <div className="course-details tutorial-details">
                        <div className="course-detail">
                          <span className="detail-icon">📊</span>
                          <span>
                            {tutorial.difficulty || 'All levels'}
                          </span>
                        </div>
                      </div>
                      <div className="course-footer tutorial-footer">
                        <div className="tutorial-meta">
                          <span className="detail-icon">🕐</span>
                          <span>{getDurationLabel(tutorial)}</span>
                        </div>
                        <div className="tutorial-meta">
                          <span className="detail-icon">📎</span>
                          <span>{getResourceLabel(tutorial)}</span>
                        </div>
                        <button className="view-details-btn">
                          View Tutorial →
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

export default Tutorials;
