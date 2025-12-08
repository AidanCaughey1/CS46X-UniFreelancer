import React, { useState, useEffect, useCallback } from "react";
import "./Seminars.css";

function Seminars() {
  const [seminars, setSeminars] = useState([]);
  const [filteredSeminars, setFilteredSeminars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: [],
    duration: [],
    status: []
  });

  // Fetch seminars
  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/academy/seminars`);
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

    // SEARCH
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.speaker?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // TYPE FILTER
    if (filters.type.length > 0) {
      filtered = filtered.filter((s) => filters.type.includes(s.type));
    }

    // DURATION FILTER
    if (filters.duration.length > 0) {
      filtered = filtered.filter((s) => {
        const mins = parseInt(s.duration) || 0;

        return filters.duration.some((range) => {
          if (range === "less-60") return mins < 60;
          if (range === "60-90") return mins >= 60 && mins <= 90;
          if (range === "more-90") return mins > 90;
          return false;
        });
      });
    }

    // STATUS FILTER
    if (filters.status.length > 0) {
      filtered = filtered.filter((s) => {
        const watched = s.watched ? "Watched" : "Not Watched";
        return filters.status.includes(watched);
      });
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

        <h2 className="section-title">Seminars & Events</h2>
        <p className="section-subtitle">Interactive live sessions and expert workshops</p>

        {/* SEARCH + SORT */}
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

          {/* ===== FILTER SIDEBAR ===== */}
          <div className="filters-sidebar">
            <h3 className="filters-title">Filter By</h3>

            {/* TYPE */}
            <div className="filter-section">
              <h4 className="filter-heading">Type</h4>
              {["Live", "Recorded", "Podcast"].map((type) => (
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

            {/* DURATION */}
            <div className="filter-section">
              <h4 className="filter-heading">Duration</h4>

              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.duration.includes("less-60")}
                  onChange={() => handleFilterChange("duration", "less-60")}
                />
                <span>Less than 60 min</span>
              </label>

              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.duration.includes("60-90")}
                  onChange={() => handleFilterChange("duration", "60-90")}
                />
                <span>60–90 min</span>
              </label>

              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.duration.includes("more-90")}
                  onChange={() => handleFilterChange("duration", "more-90")}
                />
                <span>More than 90 min</span>
              </label>
            </div>

            {/* STATUS */}
            <div className="filter-section">
              <h4 className="filter-heading">Status</h4>
              {["Watched", "Not Watched"].map((status) => (
                <label key={status} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleFilterChange("status", status)}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>

          </div>

          {/* ===== SEMINAR CARDS ===== */}
          <div className="seminars-grid">
            {loading ? (
              <div className="loading-message">Loading seminars...</div>
            ) : filteredSeminars.length === 0 ? (
              <div className="no-results">
                <p>No seminars found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ type: [], duration: [], status: [] });
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
