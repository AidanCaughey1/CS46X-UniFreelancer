import React, { useState, useEffect } from 'react';
import './InstructorDashboard.css';

function StudentsList({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name'); // name, submissions, grade

  useEffect(() => {
    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/courses/${courseId}/students`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      alert('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Sort students
    const sortedStudents = [...students].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = a.name || a.username || '';
          const nameB = b.name || b.username || '';
          return nameA.localeCompare(nameB);
        case 'submissions':
          return b.totalSubmissions - a.totalSubmissions;
        case 'grade':
          return b.averageGrade - a.averageGrade;
        default:
          return 0;
      }
    });
    
  if (loading) {
    return (
      <div className="students-loading">
        Loading students...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="empty-state">
        <h3>No students enrolled</h3>
        <p>Students will appear here once they enroll in this course.</p>
      </div>
    );
  }

  return (
    <div className="students-list-container">
      {/* Controls */}
      <div className="students-controls">
        <div className="students-count">
          <strong>{students.length}</strong> student{students.length !== 1 ? 's' : ''} enrolled
        </div>
        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="submissions">Submissions</option>
            <option value="grade">Average Grade</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="students-table">
        <div className="table-header">
          <div className="table-cell header-cell">Student</div>
          <div className="table-cell header-cell">Email</div>
          <div className="table-cell header-cell center">Submissions</div>
          <div className="table-cell header-cell center">Graded</div>
          <div className="table-cell header-cell center">Avg Grade</div>
        </div>

        <div className="table-body">
          {sortedStudents.map((student) => (
            <div key={student._id} className="table-row">
              {/* Student Info */}
              <div className="table-cell">
                <div className="student-cell">
                  <div className="student-avatar-small">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name || student.username} />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {(student.name || student.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <strong>{student.name || student.username || 'Unknown'}</strong>
                </div>
              </div>

              {/* Email */}
              <div className="table-cell">
                <span className="student-email-cell">{student.email}</span>
              </div>

              {/* Total Submissions */}
              <div className="table-cell center">
                <span className="stat-value-cell">
                  {student.totalSubmissions}
                </span>
              </div>

              {/* Graded Submissions */}
              <div className="table-cell center">
                <span className="stat-value-cell graded">
                  {student.gradedSubmissions}
                </span>
              </div>

              {/* Average Grade */}
              <div className="table-cell center">
                {student.gradedSubmissions > 0 ? (
                  <div className="grade-badge-cell">
                    <span 
                      className={`grade-value ${
                        student.averageGrade >= 90 ? 'grade-a' :
                        student.averageGrade >= 80 ? 'grade-b' :
                        student.averageGrade >= 70 ? 'grade-c' :
                        'grade-low'
                      }`}
                    >
                      {student.averageGrade}%
                    </span>
                  </div>
                ) : (
                  <span className="no-grade">N/A</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentsList;