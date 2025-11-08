import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateContent.css';

function CreateContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('course');

  const handleBackToAcademy = () => {
    navigate('/academy');
  };

  const handleCreateCourse = () => {
    navigate('/academy/create/course');
  };

  const handleCreateSeminar = () => {
    alert('Seminar creation coming soon!');
  };

  const handleCreateTutorial = () => {
    alert('Tutorial creation coming soon!');
  };

  return (
    <div className="create-content-page">
      <div className="create-content-container">
        <button className="back-link" onClick={handleBackToAcademy}>
          ← Back to Academy
        </button>

        <h1 className="page-title">Create New Content</h1>
        <p className="page-description">
          Choose the type of content you want to create and share your expertise with the UniFreelancer community.
        </p>

        {/* Tab Navigation */}
        <div className="content-tabs">
          <button 
            className={`content-tab ${activeTab === 'course' ? 'active' : ''}`}
            onClick={() => setActiveTab('course')}
          >
            Course
          </button>
          <button 
            className={`content-tab ${activeTab === 'seminar' ? 'active' : ''}`}
            onClick={() => setActiveTab('seminar')}
          >
            Seminar
          </button>
          <button 
            className={`content-tab ${activeTab === 'tutorial' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutorial')}
          >
            Tutorial
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="tab-content-area">
          {activeTab === 'course' && (
            <div className="tab-content">
              <div className="content-info">
                <h2 className="content-type-heading">Create a Course</h2>
                <p className="content-type-description">
                  Courses are comprehensive, structured learning programs designed to teach students a 
                  complete skill or subject. They typically include multiple modules, lessons, and assessments.
                </p>
                
                <div className="content-features">
                  <h3>What you can include:</h3>
                  <ul>
                    <li>Multiple modules and lessons</li>
                    <li>Video lectures and presentations</li>
                    <li>Downloadable resources</li>
                    <li>Quizzes and assessments</li>
                    <li>Certificates upon completion</li>
                    <li>Discussion forums</li>
                  </ul>
                </div>

                <button className="create-button-large" onClick={handleCreateCourse}>
                  Start Creating Course
                </button>
              </div>
            </div>
          )}

          {activeTab === 'seminar' && (
            <div className="tab-content">
              <div className="content-info">
                <h2 className="content-type-heading">Create a Seminar</h2>
                <p className="content-type-description">
                  Seminars are live or recorded webinar sessions focused on specific topics. They're perfect 
                  for workshops, presentations, and interactive learning experiences.
                </p>
                
                <div className="content-features">
                  <h3>What you can include:</h3>
                  <ul>
                    <li>Live streaming or pre-recorded sessions</li>
                    <li>Q&A sessions with attendees</li>
                    <li>Presentation slides and materials</li>
                    <li>Interactive polls and discussions</li>
                    <li>Networking opportunities</li>
                    <li>Session recordings</li>
                  </ul>
                </div>

                <button className="create-button-large" onClick={handleCreateSeminar}>
                  Start Creating Seminar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="tab-content">
              <div className="content-info">
                <h2 className="content-type-heading">Create a Tutorial</h2>
                <p className="content-type-description">
                  Tutorials are quick, focused lessons that teach a specific skill or technique. They're 
                  perfect for step-by-step guides and practical how-to content.
                </p>
                
                <div className="content-features">
                  <h3>What you can include:</h3>
                  <ul>
                    <li>Step-by-step instructions</li>
                    <li>Video demonstrations</li>
                    <li>Code snippets or templates</li>
                    <li>Screenshots and diagrams</li>
                    <li>Practice exercises</li>
                    <li>Quick reference guides</li>
                  </ul>
                </div>


                <button className="create-button-large" onClick={handleCreateTutorial}>
                  Start Creating Tutorial
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateContent;




