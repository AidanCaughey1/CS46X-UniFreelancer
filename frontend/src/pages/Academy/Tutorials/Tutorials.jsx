/* global process */
import React, { useState, useEffect, useCallback } from "react";
import "./Tutorials.css";

function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    topic: [],
    difficulty: [],
    length: [],
  });

  // Fetch tutorials
  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/academy/tutorials`);
      const data = await response.json();
      setTutorials(data);
      setFilteredTutorials(data);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering Logic
  const filterTutorials = useCallback(() => {
    let filtered = [...tutorials];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Topic filter
    if (filters.topic.length > 0) {
      filtered = filtered.filter((t) => filters.topic.includes(t.topic));
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((t) =>
        filters.difficulty.includes(t.difficulty)
      );
    }

    // Length filter
    if (filters.length.length > 0) {
      filtered = filtered.filter((t) =>
        filters.length.includes(t.lengthCategory)
      );
    }

    setFilteredTutorials(filtered);
  }, [tutorials, searchTerm, filters]);

  useEffect(() => {
    filterTutorials();
  }, [filterTutorials]);

  // Toggle handler for filters
  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const updated = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];

      return { ...prev, [category]: updated };
    });
  };

  return (
    <div className="tutorials-page">
      <div className="tutorials-container">

        <h2 className="section-title">Tutorials</h2>
        <p className="section-subtitle">
          Quick, focused lessons to help you improve your freelance skills.
        </p>

        {/* Search + Sort */}
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
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Trending</option>
          </select>
        </div>

        <div className="tutorials-content">

          {/* FILTER SIDEBAR */}
          <div className="filters-sidebar">
            <h3 className="filters-title">Filter By</h3>

            {/* Topic */}
            <div className="filter-section">
              <h4 className="filter-heading">Topic</h4>

              {["Design", "Marketing", "Development", "Business"].map((topic) => (
                <label key={topic} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.topic.includes(topic)}
                    onChange={() => handleFilterChange("topic", topic)}
                  />
                  <span>{topic}</span>
                </label>
              ))}
            </div>

            {/* Difficulty */}
            <div className="filter-section">
              <h4 className="filter-heading">Difficulty</h4>

              {["Beginner", "Intermediate", "Advanced"].map((d) => (
                <label key={d} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.difficulty.includes(d)}
                    onChange={() => handleFilterChange("difficulty", d)}
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>

            {/* Length */}
            <div className="filter-section">
              <h4 className="filter-heading">Length</h4>

              {["Short", "Medium", "Long"].map((l) => (
                <label key={l} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.length.includes(l)}
                    onChange={() => handleFilterChange("length", l)}
                  />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* TUTORIAL GRID */}
          <div className="tutorials-grid">
            {loading ? (
              <div className="loading-message">Loading tutorials...</div>
            ) : filteredTutorials.length === 0 ? (
              <div className="no-results">
                <p>No tutorials match your search or filters.</p>
                <button onClick={() => {
                  setSearchTerm("");
                  setFilters({ topic: [], difficulty: [], length: [] });
                }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredTutorials.map((tut) => (
                <div className="tutorial-card" key={tut._id}>
                  <div className="tutorial-image">
                    {tut.thumbnail ? (
                      <img src={tut.thumbnail} alt={tut.title} />
                    ) : (
                      <div className="placeholder-image">📘</div>
                    )}
                  </div>

                  <div className="tutorial-content">
                    <h3 className="tutorial-title">{tut.title}</h3>

                    <p className="tutorial-description">
                      {tut.description.substring(0, 90)}...
                    </p>

                    <div className="tutorial-details">
                      <div className="tutorial-detail">
                        📚 <span>{tut.topic}</span>
                      </div>
                      <div className="tutorial-detail">
                        🎯 <span>{tut.difficulty}</span>
                      </div>
                      <div className="tutorial-detail">
                        ⏱️ <span>{tut.lengthCategory}</span>
                      </div>
                    </div>

                    <button className="view-details-btn">
                      View Tutorial →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Tutorials;
