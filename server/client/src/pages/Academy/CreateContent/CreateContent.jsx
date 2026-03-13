import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

function CreateContent({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('course');
  const isAdmin = user?.accountType === 'admin';

  const handleBackToAcademy = () => {
    navigate('/academy');
  };

  const handleCreateCourse = () => {
    navigate('/academy/create/course');
  };

  const handleCreateSeminar = () => {
    navigate('/academy/create/seminar');
  };

  const handleCreateTutorial = () => {
    navigate('/academy/create/tutorial');
  };

  const tabClasses = (tabName) =>
    `flex-1 border-none px-2.5 py-3 text-xs font-semibold text-dark transition-all duration-300 sm:px-4 sm:py-3.5 sm:text-sm md:px-6 md:py-5 md:text-base ${
      activeTab === tabName
        ? 'bg-light-tertiary'
        : 'bg-light-primary hover:bg-light-secondary'
    }`;

  const liClasses = "relative py-2 pl-7 text-sm leading-relaxed text-dark-secondary before:absolute before:left-0 before:font-bold before:text-accent before:content-['\\2713'] sm:py-2.5 sm:pl-[30px] sm:text-md";

  return (
    <div className="min-h-screen bg-main-bg px-[15px] pt-5 md:px-6 md:pt-[100px]">
      <div className="mx-auto max-w-[1000px]">
        <button className="mb-8 inline-flex items-center border-none bg-transparent py-2 text-base text-dark transition-colors duration-300 hover:text-dark-secondary" onClick={handleBackToAcademy}>
          <FiArrowLeft className="mr-1 inline" /> Back to Academy
        </button>

        <h1 className="mb-4 text-center text-3xl font-bold text-dark md:text-5xl">Create New Content</h1>
        <p className="mx-auto mb-10 max-w-[700px] text-center text-md leading-relaxed text-dark-secondary md:text-base">
          Choose the type of content you want to create and share your expertise with the UniFreelancer community.
        </p>

        <div className="overflow-hidden rounded-t shadow-sm">
          <div className="flex">
            <button
              className={`${tabClasses('course')} border-r border-[#d0d0d0]`}
            onClick={() => setActiveTab('course')}
          >
            Course
          </button>
            <button
              className={`${tabClasses('seminar')} ${isAdmin ? 'border-r border-[#d0d0d0]' : ''}`}
            onClick={() => setActiveTab('seminar')}
          >
            Seminar
          </button>
          {isAdmin && (
              <button
                className={tabClasses('tutorial')}
              onClick={() => setActiveTab('tutorial')}
            >
              Tutorial
            </button>
          )}
        </div>
        </div>

        <div className="min-h-[400px] rounded-b bg-light-tertiary px-5 py-[25px] sm:px-[25px] sm:py-[30px] md:min-h-[500px] md:px-16 md:py-12">
          {activeTab === 'course' && (
            <div className="animate-fade-in-up">
              <div className="mx-auto max-w-[700px]">
                <h2 className="mb-5 text-[22px] font-bold text-dark sm:text-[26px] md:text-4xl">Create a Course</h2>
                <p className="mb-8 text-md leading-[1.7] text-dark-secondary md:text-[17px]">
                  Courses are comprehensive, structured learning programs designed to teach students a 
                  complete skill or subject. They typically include multiple modules, lessons, and assessments.
                </p>
                
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold text-dark md:text-xl">What you can include:</h3>
                  <ul className="list-none p-0">
                    <li className={liClasses}>Multiple modules and lessons</li>
                    <li className={liClasses}>Video lectures and presentations</li>
                    <li className={liClasses}>Downloadable resources</li>
                    <li className={liClasses}>Quizzes and assessments</li>
                    <li className={liClasses}>Certificates upon completion</li>
                    <li className={liClasses}>Discussion forums</li>
                  </ul>
                </div>

                <button className="w-full rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-accent-tertiary md:px-8 md:py-4 md:text-[17px]" onClick={handleCreateCourse}>
                  Start Creating Course
                </button>
              </div>
            </div>
          )}

          {activeTab === 'seminar' && (
            <div className="animate-fade-in-up">
              <div className="mx-auto max-w-[700px]">
                <h2 className="mb-5 text-[22px] font-bold text-dark sm:text-[26px] md:text-4xl">Create a Seminar</h2>
                <p className="mb-8 text-md leading-[1.7] text-dark-secondary md:text-[17px]">
                  Seminars are live or recorded webinar sessions focused on specific topics. They're perfect 
                  for workshops, presentations, and interactive learning experiences.
                </p>
                
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold text-dark md:text-xl">What you can include:</h3>
                  <ul className="list-none p-0">
                    <li className={liClasses}>Live streaming or pre-recorded sessions</li>
                    <li className={liClasses}>Q&A sessions with attendees</li>
                    <li className={liClasses}>Presentation slides and materials</li>
                    <li className={liClasses}>Interactive polls and discussions</li>
                    <li className={liClasses}>Networking opportunities</li>
                    <li className={liClasses}>Session recordings</li>
                  </ul>
                </div>

                <button className="w-full rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-accent-tertiary md:px-8 md:py-4 md:text-[17px]" onClick={handleCreateSeminar}>
                  Start Creating Seminar
                </button>
              </div>
            </div>
          )}

          {isAdmin && activeTab === 'tutorial' && (
            <div className="animate-fade-in-up">
              <div className="mx-auto max-w-[700px]">
                <h2 className="mb-5 text-[22px] font-bold text-dark sm:text-[26px] md:text-4xl">Create a Tutorial</h2>
                <p className="mb-8 text-md leading-[1.7] text-dark-secondary md:text-[17px]">
                  Tutorials are quick, focused lessons that teach a specific skill or technique. They're 
                  perfect for step-by-step guides and practical how-to content.
                </p>
                
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold text-dark md:text-xl">What you can include:</h3>
                  <ul className="list-none p-0">
                    <li className={liClasses}>Step-by-step instructions</li>
                    <li className={liClasses}>Video demonstrations</li>
                    <li className={liClasses}>Code snippets or templates</li>
                    <li className={liClasses}>Screenshots and diagrams</li>
                    <li className={liClasses}>Practice exercises</li>
                    <li className={liClasses}>Quick reference guides</li>
                  </ul>
                </div>


                <button className="w-full rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-accent-tertiary md:px-8 md:py-4 md:text-[17px]" onClick={handleCreateTutorial}>
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

CreateContent.propTypes = {
  user: PropTypes.shape({
    accountType: PropTypes.string
  })
};

export default CreateContent;
