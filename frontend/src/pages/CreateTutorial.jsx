import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTutorial.css';

function CreateTutorial() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState('details');

  // Tutorial core fields
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [estimatedTime, setEstimatedTime] = useState('');

  // Video: dummy upload + URL
  const [videoFileName, setVideoFileName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Downloadable resources (dummy uploads)
  const [downloadTitle, setDownloadTitle] = useState('');
  const [downloadFileName, setDownloadFileName] = useState('');
  const [downloadableResources, setDownloadableResources] = useState([]);

  // External link resources
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [externalResources, setExternalResources] = useState([]);

  const handleBack = () => {
    navigate('/academy/create');
  };

  const handleCancel = () => {
    navigate('/academy/create');
  };

  // Video file "upload" (dummy: just store filename)
  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFileName(file.name);
    } else {
      setVideoFileName('');
    }
  };

  // Add downloadable file (dummy upload)
  const handleAddDownloadable = (e) => {
    e.preventDefault();
    if (!downloadTitle.trim() && !downloadFileName.trim()) return;

    setDownloadableResources((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: downloadTitle.trim() || 'Untitled file',
        fileName: downloadFileName.trim() || 'uploaded-file',
      },
    ]);

    setDownloadTitle('');
    setDownloadFileName('');
  };

  const handleDownloadFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDownloadFileName(file.name);
    } else {
      setDownloadFileName('');
    }
  };

  const handleRemoveDownloadable = (id) => {
    setDownloadableResources((prev) => prev.filter((res) => res.id !== id));
  };

  // Add external link resource
  const handleAddExternalLink = (e) => {
    e.preventDefault();
    if (!linkTitle.trim() && !linkUrl.trim()) return;

    setExternalResources((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: linkTitle.trim() || 'Untitled resource',
        url: linkUrl.trim(),
      },
    ]);

    setLinkTitle('');
    setLinkUrl('');
  };

  const handleRemoveExternalLink = (id) => {
    setExternalResources((prev) => prev.filter((res) => res.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      description: shortDescription,
      category,
      difficulty,
      estimatedTime,
      video: {
        fileName: videoFileName,
        url: videoUrl,
      },
      downloadableResources,
      externalResources,
    };

    try {
      const response = await fetch(
        'http://localhost:5000/api/academy/tutorials',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert('Tutorial created successfully!');
        setTitle('');
        setShortDescription('');
        setCategory('');
        setDifficulty('Beginner');
        setEstimatedTime('');
        setVideoFileName('');
        setVideoUrl('');
        setDownloadTitle('');
        setDownloadFileName('');
        setDownloadableResources([]);
        setLinkTitle('');
        setLinkUrl('');
        setExternalResources([]);
        navigate('/academy/tutorials');
      } else {
        console.error('Failed to create tutorial');
        alert('Failed to create tutorial. Please try again.');
      }
    } catch (err) {
      console.error('Error creating tutorial:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const steps = [
    { id: 'details', label: 'Details' },
    { id: 'video', label: 'Video' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        <h1 className="create-course-title">Create New Tutorial</h1>
        <p className="create-course-subtitle">
          Set up a focused, self-paced video tutorial with optional supporting resources.
        </p>

        {/* Step navigation */}
        <div className="step-navigation">
          {steps.map((step) => (
            <button
              key={step.id}
              className={`step-button ${
                currentStep === step.id ? 'active' : ''
              }`}
              onClick={() => setCurrentStep(step.id)}
              type="button"
            >
              {step.label}
            </button>
          ))}
        </div>

        <form className="create-course-form" onSubmit={handleSubmit}>
          {currentStep === 'details' && (
            <section className="form-section">
              <h2 className="section-title">Tutorial Details</h2>
              <p className="section-subtitle">
                Give your tutorial a clear title and description so learners
                know exactly what they'll get.
              </p>

              <div className="form-grid">
                <div className="form-field">
                  <label>
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Writing your first client proposal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="Client Management, Portfolio, Outreach..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Estimated Time (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    placeholder="45"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>Short Description</label>
                <textarea
                  rows={3}
                  placeholder="A quick walkthrough to help learners complete this skill in under an hour."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>
            </section>
          )}

          {currentStep === 'video' && (
            <section className="form-section">
              <h2 className="section-title">Video & Delivery</h2>
              <p className="section-subtitle">
                Tutorials are primarily video-based. You can either upload a
                video file (dummy upload for now) or provide a hosted URL
                (YouTube, Vimeo, etc.).
              </p>

              <div className="form-grid">
                <div className="form-field">
                  <label>Upload Video (dummy)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                  />
                  {videoFileName && (
                    <p className="form-section-subtitle">
                      Selected file: <strong>{videoFileName}</strong>
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label>
                    Video URL <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtu.be/your-tutorial"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>
          )}

          {currentStep === 'resources' && (
            <section className="form-section">
              <h2 className="section-title">Supporting Resources</h2>
              <p className="section-subtitle">
                Add downloadable files (like templates or slides) and external
                links that support this tutorial.
              </p>

              {/* Downloadable resources (dummy uploads) */}
              <h3 className="form-section-subtitle">
                Downloadable resources (files)
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>File Title</label>
                  <input
                    type="text"
                    placeholder="Proposal template PDF"
                    value={downloadTitle}
                    onChange={(e) => setDownloadTitle(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Upload File (dummy)</label>
                  <input
                    type="file"
                    onChange={handleDownloadFileChange}
                  />
                  {downloadFileName && (
                    <p className="form-section-subtitle">
                      Selected file: <strong>{downloadFileName}</strong>
                    </p>
                  )}
                </div>
              </div>
              <button
                className="primary-button"
                style={{ marginTop: '12px' }}
                onClick={handleAddDownloadable}
                type="button"
              >
                + Add Downloadable Resource
              </button>

              {downloadableResources.length > 0 && (
                <div className="resources-list" style={{ marginTop: '16px' }}>
                  <h3 className="form-section-subtitle">
                    Downloadable Files ({downloadableResources.length})
                  </h3>
                  <ul>
                    {downloadableResources.map((res) => (
                      <li key={res.id} className="resource-item">
                        <div>
                          <strong>{res.title}</strong>{' '}
                          {res.fileName && <>– {res.fileName}</>}
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleRemoveDownloadable(res.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* External link resources */}
              <h3 className="form-section-subtitle" style={{ marginTop: '24px' }}>
                External links
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Resource Title</label>
                  <input
                    type="text"
                    placeholder="Deep dive article"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Resource URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="primary-button"
                style={{ marginTop: '12px' }}
                onClick={handleAddExternalLink}
                type="button"
              >
                + Add External Link
              </button>

              {externalResources.length > 0 && (
                <div className="resources-list" style={{ marginTop: '16px' }}>
                  <h3 className="form-section-subtitle">
                    External Resources ({externalResources.length})
                  </h3>
                  <ul>
                    {externalResources.map((res) => (
                      <li key={res.id} className="resource-item">
                        <div>
                          <strong>{res.title}</strong>
                          {res.url && (
                            <>
                              {' '}
                              –{' '}
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {res.url}
                              </a>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleRemoveExternalLink(res.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Tutorial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTutorial;