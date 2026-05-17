import React from 'react';
import './InstructorDashboard.css';

function InstructorStats({ stats }) {
  if (!stats) {
    return (
      <div className="stats-loading">
        Loading stats...
      </div>
    );
  }

  const statCards = [
    {
      icon: '📚',
      label: 'Total Courses',
      value: stats.totalCourses,
      color: '#4F46E5'
    },
    {
      icon: '👥',
      label: 'Total Students',
      value: stats.totalStudents,
      color: '#10b981'
    },
    {
      icon: '📝',
      label: 'Pending Submissions',
      value: stats.pendingSubmissions,
      color: '#f59e0b',
      highlight: stats.pendingSubmissions > 0
    },
    {
      icon: '✅',
      label: 'Total Graded',
      value: stats.totalGraded,
      color: '#06b6d4'
    },
    {
      icon: '📊',
      label: 'Average Grade',
      value: `${stats.averageGrade}%`,
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="instructor-stats">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`stat-card ${stat.highlight ? 'highlight' : ''}`}
            style={{ '--stat-color': stat.color }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InstructorStats;