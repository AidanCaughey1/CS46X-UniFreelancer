import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorStats from './InstructorStats';
import InstructorCourseCard from './InstructorCourseCard';
import PendingSubmissions from './PendingSubmissions';
import StudentsList from './StudentsList';
import './InstructorDashboard.css';

function InstructorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsRes = await fetch('/api/instructor/dashboard/stats', {
        credentials: 'include'
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      const coursesRes = await fetch('/api/instructor/courses', {
        credentials: 'include'
      });
      const coursesData = await coursesRes.json();
      setCourses(Array.isArray(coursesData) ? coursesData : []);

      const pendingRes = await fetch('/api/instructor/submissions/pending', {
        credentials: 'include'
      });
      const pendingData = await pendingRes.json();
      
      // CRITICAL FIX: Ensure pendingSubmissions is always an array
      setPendingSubmissions(Array.isArray(pendingData) ? pendingData : []);

      const draftsRes = await fetch('/api/academy/drafts', {
        credentials: 'include'
      });
      if (draftsRes.ok) {
        const draftsData = await draftsRes.json();
        setDrafts(Array.isArray(draftsData) ? draftsData : []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Set empty arrays on error to prevent crashes
      setCourses([]);
      setPendingSubmissions([]);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCourse = async (courseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include", // IMPORTANT since you're using cookies elsewhere
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete course");
      }

      // remove from UI immediately
      setCourses(prev => prev.filter(course => course._id !== courseId));

      console.log("Course deleted:", data.message);

    } catch (err) {
      console.error("Delete error:", err.message);
      alert(err.message);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    const confirmed = window.confirm("Are you sure you want to delete this draft?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/academy/drafts/${draftId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete draft");
      setDrafts(prev => prev.filter(draft => draft._id !== draftId));
    } catch (err) {
      console.error("Delete draft error:", err.message);
      alert(err.message);
    }
  };
  const handleGradeSubmission = (submissionId) => {
    navigate(`/instructor/grade/${submissionId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/academy/courses/${courseId}`);
  };

  const handleEditCourse = (courseId) => {
    navigate(`/academy/create/${courseId}`);
  };

  if (loading) {
    return (
      <div className="instructor-dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard-page">
      <div className="instructor-dashboard-container">
        <div className="dashboard-header">
          <h1>Instructor Dashboard</h1>
          <button
            className="create-course-button"
            onClick={() => navigate('/academy/create')}
          >
            + Create New Course
          </button>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 My Courses
          </button>
          <button
            className={`tab ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            📝 Drafts
            {drafts && drafts.length > 0 && (
              <span className="badge">{drafts.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            📝 Submissions
            {pendingSubmissions && pendingSubmissions.length > 0 && (
              <span className="badge">{pendingSubmissions.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Students
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <InstructorStats stats={stats} />

              <div className="recent-activity-section">
                <h2>Recent Submissions</h2>
                {!pendingSubmissions || pendingSubmissions.length === 0 ? (
                  <div className="empty-state">
                    <p>No pending submissions. Great job! 🎉</p>
                  </div>
                ) : (
                  <div className="submissions-preview">
                    {(pendingSubmissions || []).slice(0, 5).map((submission) => (
                      <div key={submission._id} className="submission-preview-item">
                        <div className="submission-info">
                          <strong>{submission.studentName}</strong>
                          <span className="submission-meta">
                            {submission.courseName} • {submission.assignmentTitle}
                          </span>
                          <span className="submission-date">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          className="grade-button-small"
                          onClick={() => handleGradeSubmission(submission._id)}
                        >
                          Grade
                        </button>
                      </div>
                    ))}
                    {pendingSubmissions.length > 5 && (
                      <button
                        className="view-all-button"
                        onClick={() => setActiveTab('submissions')}
                      >
                        View All {pendingSubmissions.length} Submissions →
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="courses-preview-section">
                <h2>My Courses</h2>
                <div className="courses-grid">
                  {(courses || []).slice(0, 3).map((course) => (
                    <InstructorCourseCard
                      key={course._id}
                      course={course}
                      onView={handleViewCourse}
                      onEdit={handleEditCourse}
                      onDelete={handleDeleteCourse}
                    />
                  ))}
                </div>
                {courses && courses.length > 3 && (
                  <button
                    className="view-all-button"
                    onClick={() => setActiveTab('courses')}
                  >
                    View All {courses.length} Courses →
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="courses-tab">
              <div className="tab-header">
                <h2>My Courses ({courses ? courses.length : 0})</h2>
                <button
                  className="create-course-button-secondary"
                  onClick={() => navigate('/academy/create')}
                >
                  + New Course
                </button>
              </div>

              {!courses || courses.length === 0 ? (
                <div className="empty-state">
                  <h3>No courses yet</h3>
                  <p>Create your first course to start teaching!</p>
                  <button
                    className="create-course-button"
                    onClick={() => navigate('/academy/create')}
                  >
                    Create Course
                  </button>
                </div>
              ) : (
                <div className="courses-grid">
                  {(courses || []).map((course) => (
                    <InstructorCourseCard
                      key={course._id}
                      course={course}
                      onView={handleViewCourse}
                      onEdit={handleEditCourse}
                      onDelete={handleDeleteCourse}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="courses-tab">
              <div className="tab-header">
                <h2>My Drafts ({drafts ? drafts.length : 0})</h2>
                <button
                  className="create-course-button-secondary"
                  onClick={() => navigate('/academy/create')}
                >
                  + New Content
                </button>
              </div>

              {!drafts || drafts.length === 0 ? (
                <div className="empty-state">
                  <h3>No drafts yet</h3>
                  <p>Incomplete courses, tutorials, and seminars will appear here.</p>
                  <p style={{fontSize: '12px', color: '#888', marginTop: '8px'}}>Drafts are automatically removed after 30 days of inactivity.</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {drafts.map((draft) => (
                    <div key={draft._id} className="instructor-course-card">
                      {/* Thumbnail area - reused as a type banner */}
                      <div className="course-card-thumbnail">
                        <div className="placeholder-thumbnail draft-thumbnail">
                          {draft.contentType === 'course' ? '📚' : draft.contentType === 'seminar' ? '🎤' : '📝'}
                        </div>
                        <span className="lite-badge-card draft-badge">Draft</span>
                      </div>

                      {/* Content */}
                      <div className="course-card-content">
                        <h3 className="course-card-title">{draft.contentData?.title || '(Untitled)'}</h3>

                        <div className="course-card-meta">
                          <span className="meta-item" style={{textTransform: 'capitalize'}}>
                            📁 {draft.contentType}
                          </span>
                          <span className="meta-item">
                            🕒 {new Date(draft.lastSavedAt).toLocaleDateString()}
                          </span>
                          <span className="meta-item" style={{color: (() => {
                            const days = Math.max(0, 30 - Math.floor((Date.now() - new Date(draft.updatedAt || draft.lastSavedAt).getTime()) / (1000 * 60 * 60 * 24)));
                            return days <= 7 ? '#e74c3c' : days <= 14 ? '#f39c12' : '#888';
                          })()}}>
                            ⏳ {Math.max(0, 30 - Math.floor((Date.now() - new Date(draft.updatedAt || draft.lastSavedAt).getTime()) / (1000 * 60 * 60 * 24)))}d left
                          </span>
                        </div>

                        <div className="course-card-price">
                          <span className="difficulty-badge">
                            {draft.contentData?.description
                              ? draft.contentData.description.substring(0, 40) + '...'
                              : 'No description'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="course-card-actions">
                        <button 
                          className="action-button view-button" 
                          onClick={() => navigate(`/academy/create/${draft.contentType}?draftId=${draft._id}`)}
                        >
                          ✏️ Resume
                        </button>
                        <button 
                          className="action-button edit-button" 
                          onClick={() => handleDeleteDraft(draft._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="submissions-tab">
              <PendingSubmissions
                submissions={pendingSubmissions || []}
                onGrade={handleGradeSubmission}
                onRefresh={fetchDashboardData}
              />
            </div>
          )}

          {activeTab === 'students' && (
            <div className="students-tab">
              <div className="tab-header">
                <h2>Students Across All Courses</h2>
                <select
                  className="course-filter"
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(e.target.value || null)}
                >
                  <option value="">All Courses</option>
                  {(courses || []).map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse ? (
                <StudentsList courseId={selectedCourse} />
              ) : (
                <div className="all-students-view">
                  <p className="helper-text">
                    Select a course above to view enrolled students and their progress.
                  </p>
                  <div className="courses-list-simple">
                    {(courses || []).map((course) => (
                      <div
                        key={course._id}
                        className="course-item-simple"
                        onClick={() => setSelectedCourse(course._id)}
                      >
                        <strong>{course.title}</strong>
                        <span>{course.enrolledCount || 0} students</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;