import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit3, FiX, FiTrash2 } from 'react-icons/fi';

function CreateContent({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('course');
  const [drafts, setDrafts] = useState([]);
  const [draftPickerType, setDraftPickerType] = useState(null); // null = closed, 'course'|'seminar'|'tutorial' = open
  const isAdmin = user?.accountType === 'admin';

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch('/api/academy/drafts', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setDrafts(data);
        }
      } catch (error) {
        console.error("Error fetching drafts:", error);
      }
    };
    fetchDrafts();
  }, []);

  // Helper to find ALL drafts for a given type
  const getDraftsForType = (type) => {
    return drafts.filter(draft => draft.contentType === type);
  };

  const handleResumeDraft = (type) => {
    const typeDrafts = getDraftsForType(type);
    if (typeDrafts.length === 1) {
      // Only one draft — go directly
      navigate(`/academy/create/${type}?draftId=${typeDrafts[0]._id}`);
    } else {
      // Multiple drafts — open picker modal
      setDraftPickerType(type);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    try {
      const res = await fetch(`/api/academy/drafts/${draftId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setDrafts(prev => prev.filter(d => d._id !== draftId));
        // Close modal if no more drafts of this type
        if (draftPickerType) {
          const remaining = drafts.filter(d => d._id !== draftId && d.contentType === draftPickerType);
          if (remaining.length === 0) setDraftPickerType(null);
        }
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

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

  const pickerDrafts = draftPickerType ? getDraftsForType(draftPickerType) : [];

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
                <h2 className="mb-5 text-lg font-bold text-dark sm:text-xl md:text-3xl">Create a Course</h2>
                <p className="mb-8 text-sm leading-[1.7] text-dark-secondary">
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

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button className="flex-1 rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-accent-tertiary md:px-8 md:py-4 md:text-sm" onClick={handleCreateCourse}>
                    Start Creating Course
                  </button>
                  {getDraftsForType('course').length > 0 && (
                    <button 
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-border bg-white px-7 py-3.5 text-base font-semibold text-dark shadow-sm transition-all duration-300 hover:bg-light-secondary md:px-8 md:py-4 md:text-sm" 
                      onClick={() => handleResumeDraft('course')}
                    >
                      <FiEdit3 />
                      Resume Draft {getDraftsForType('course').length > 1 ? `(${getDraftsForType('course').length})` : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seminar' && (
            <div className="animate-fade-in-up">
              <div className="mx-auto max-w-[700px]">
                <h2 className="mb-5 text-lg font-bold text-dark sm:text-xl md:text-3xl">Create a Seminar</h2>
                <p className="mb-8 text-sm leading-[1.7] text-dark-secondary">
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

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button className="flex-1 rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-accent-tertiary md:px-8 md:py-4 md:text-sm" onClick={handleCreateSeminar}>
                    Start Creating Seminar
                  </button>
                  {getDraftsForType('seminar').length > 0 && (
                    <button 
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-border bg-white px-7 py-3.5 text-base font-semibold text-dark shadow-sm transition-all duration-300 hover:bg-light-secondary md:px-8 md:py-4 md:text-sm" 
                      onClick={() => handleResumeDraft('seminar')}
                    >
                      <FiEdit3 />
                      Resume Draft {getDraftsForType('seminar').length > 1 ? `(${getDraftsForType('seminar').length})` : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAdmin && activeTab === 'tutorial' && (
            <div className="animate-fade-in-up">
              <div className="mx-auto max-w-[700px]">
                <h2 className="mb-5 text-lg font-bold text-dark sm:text-xl md:text-3xl">Create a Tutorial</h2>
                <p className="mb-8 text-sm leading-[1.7] text-dark-secondary">
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

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button className="flex-1 rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-accent-tertiary md:px-8 md:py-4 md:text-sm" onClick={handleCreateTutorial}>
                    Start Creating Tutorial
                  </button>
                  {getDraftsForType('tutorial').length > 0 && (
                    <button 
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-border bg-white px-7 py-3.5 text-base font-semibold text-dark shadow-sm transition-all duration-300 hover:bg-light-secondary md:px-8 md:py-4 md:text-sm" 
                      onClick={() => handleResumeDraft('tutorial')}
                    >
                      <FiEdit3 />
                      Resume Draft {getDraftsForType('tutorial').length > 1 ? `(${getDraftsForType('tutorial').length})` : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draft Picker Modal */}
      {draftPickerType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDraftPickerType(null)}>
          <div 
            className="relative mx-4 w-full max-w-lg rounded-[24px] border border-border bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute right-4 top-4 rounded-full p-2 text-dark-secondary transition hover:bg-light-secondary hover:text-dark"
              onClick={() => setDraftPickerType(null)}
            >
              <FiX size={20} />
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {draftPickerType}s
            </p>
            <h2 className="mt-1 text-2xl font-bold text-dark">Select a Draft</h2>
            <p className="mt-2 text-sm text-dark-secondary">
              You have {pickerDrafts.length} saved draft{pickerDrafts.length > 1 ? 's' : ''}. Choose one to resume editing.
            </p>
            <p className="mt-1 text-xs text-dark-secondary/50">
              ⏳ Drafts are automatically removed after 30 days of inactivity.
            </p>

            <div className="mt-6 flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-1">
              {pickerDrafts.map((draft) => (
                <div 
                  key={draft._id} 
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-light-tertiary p-4 transition hover:border-accent/30 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/academy/create/${draftPickerType}?draftId=${draft._id}`)}>
                    <h3 className="truncate text-sm font-bold text-dark">
                      {draft.contentData?.title || '(Untitled)'}
                    </h3>
                    <p className="mt-1 truncate text-xs text-dark-secondary">
                      {draft.contentData?.description || draft.contentData?.overview || 'No description'}
                    </p>
                    <p className="mt-1.5 text-[11px] text-dark-secondary/60">
                      Last saved {new Date(draft.lastSavedAt).toLocaleDateString()} at {new Date(draft.lastSavedAt).toLocaleTimeString()}
                      {' • '}
                      <span style={{color: (() => {
                        const days = Math.max(0, 30 - Math.floor((Date.now() - new Date(draft.updatedAt || draft.lastSavedAt).getTime()) / (1000 * 60 * 60 * 24)));
                        return days <= 7 ? '#e74c3c' : days <= 14 ? '#f39c12' : 'inherit';
                      })()}}>
                        {Math.max(0, 30 - Math.floor((Date.now() - new Date(draft.updatedAt || draft.lastSavedAt).getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-tertiary"
                      onClick={() => navigate(`/academy/create/${draftPickerType}?draftId=${draft._id}`)}
                    >
                      Resume
                    </button>
                    <button
                      className="rounded-full p-2 text-dark-secondary/40 transition hover:bg-red-50 hover:text-error"
                      onClick={() => handleDeleteDraft(draft._id)}
                      title="Delete draft"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

CreateContent.propTypes = {
  user: PropTypes.shape({
    accountType: PropTypes.string
  })
};

export default CreateContent;
