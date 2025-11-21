import React, { useState, useEffect, useCallback } from "react";
import "./Seminars.css";

function Seminars() {
  const [seminars, setSeminars] = useState([]);
  const [filteredSeminars, setFilteredSeminars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: [], // Live Now, Recorded, Hybrid
  });

  // Fetch seminars
  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/academy/seminars");
      const data = await response.json();
      setSeminars(data);
      setFilteredSeminars(data);
    } catch (error) {
      console.error("Error fetching seminars:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filterSeminars = useCallback(() => {
    let filtered = [...seminars];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((seminar) =>
        seminar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.speaker?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter((seminar) =>
        filters.type.includes(seminar.type)
      );
    }

    setFilteredSeminars(filtered);
  }, [seminars, searchTerm, filters]);

  useEffect(() => {
    filterSeminars();
  }, [filterSeminars]);

  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      return { ...prev, [category]: updated };
    });
  };

  return (
    <div className="seminars-page">
      <div className="seminars-container">
        
        <h2 className="section-title">Seminars</h2>
        <p className="section-subtitle">
          Live and recorded sessions to develop your freelance skills
        </p>

        {/* Search + Sort */}
        <div className="search-bar-container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search seminars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="sort-dropdown">
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Live Sessions</option>
          </select>
        </div>

        <div className="seminars-content">
          {/* Sidebar Filters */}
          <div className="filters-sidebar">
            <h3 className="filters-title">Filter By</h3>

            <div className="filter-section">
              <h4 className="filter-heading">Seminar Type</h4>

              {["Live Now", "Recorded", "Hybrid"].map((type) => (
                <label key={type} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleFilterChange("type", type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Seminar Cards Grid */}
          <div className="seminars-grid">
            {loading ? (
              <div className="loading-message">Loading seminars...</div>
            ) : filteredSeminars.length === 0 ? (
              <div className="no-results">
                <p>No seminars found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ type: [] });
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredSeminars.map((seminar) => (
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
                      {seminar.description.substring(0, 80)}...
                    </p>

                    <div className="seminar-details">
                      <div className="seminar-detail">
                        <span className="detail-icon">🗣️</span>
                        <span>{seminar.speaker?.name || "Unknown Speaker"}</span>
                      </div>

                      <div className="seminar-detail">
                        <span className="detail-icon">📅</span>
                        <span>{seminar.schedule?.date || "TBD"}</span>
                      </div>

                      <div className="seminar-detail">
                        <span className="detail-icon">🎧</span>
                        <span>{seminar.type}</span>
                      </div>
                    </div>

                    <div className="seminar-footer">
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
  );
}

export default Seminars;
