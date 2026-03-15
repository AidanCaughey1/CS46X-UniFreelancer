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
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await fetch('/api/instructor/dashboard/stats', {
        credentials: 'include'
      });
      const statsData = await statsRes.json();
      setStats(statsData || {});

      // Fetch courses
      const coursesRes = await fetch('/api/instructor/courses', {
        credentials: 'include'
      });
      const coursesData = await coursesRes.json();
      setCourses(Array.isArray(coursesData) ? coursesData : []);

      // Fetch pending submissions
      const pendingRes = await fetch('/api/instructor/submissions/pending', {
        credentials: 'include'
      });
      const pendingData = await pendingRes.json();
      setPendingSubmissions(Array.isArray(pendingData) ? pendingData : []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      alert('Failed to load dashboard');
    } finally {
      setLoading(false);
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
        {/* Header */}
        <div className="dashboard-header">
          <h1>Instructor Dashboard</h1>
          <button 
            className="create-course-button"
            onClick={() => navigate('/academy/create')}
          >
            + Create New Course
          </button>
        </div>

        {/* Tabs */}
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
            className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            📝 Submissions
            {pendingSubmissions.length > 0 && (
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

        {/* Tab Content */}
        <div className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <InstructorStats stats={stats} />

              {/* Recent Activity */}
              <div className="recent-activity-section">
                <h2>Recent Submissions</h2>
                {pendingSubmissions.length === 0 ? (
                  <div className="empty-state">
                    <p>No pending submissions. Great job! 🎉</p>
                  </div>
                ) : (
                  <div className="submissions-preview">
                    {pendingSubmissions.slice(0, 5).map((submission) => (
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

              {/* Courses Preview */}
              <div className="courses-preview-section">
                <h2>My Courses</h2>
                <div className="courses-grid">
                  {courses.slice(0, 3).map((course) => (
                    <InstructorCourseCard
                      key={course._id}
                      course={course}
                      onView={handleViewCourse}
                      onEdit={handleEditCourse}
                    />
                  ))}
                </div>
                {courses.length > 3 && (
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

          {/* My Courses Tab */}
          {activeTab === 'courses' && (
            <div className="courses-tab">
              <div className="tab-header">
                <h2>My Courses ({courses.length})</h2>
                <button
                  className="create-course-button-secondary"
                  onClick={() => navigate('/academy/create')}
                >
                  + New Course
                </button>
              </div>

              {courses.length === 0 ? (
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
                  {courses.map((course) => (
                    <InstructorCourseCard
                      key={course._id}
                      course={course}
                      onView={handleViewCourse}
                      onEdit={handleEditCourse}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="submissions-tab">
              <PendingSubmissions
                submissions={pendingSubmissions}
                onGrade={handleGradeSubmission}
                onRefresh={fetchDashboardData}
              />
            </div>
          )}

          {/* Students Tab */}
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
                  {courses.map((course) => (
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
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        className="course-item-simple"
                        onClick={() => setSelectedCourse(course._id)}
                      >
                        <strong>{course.title}</strong>
                        <span>{course.enrolledCount} students</span>
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