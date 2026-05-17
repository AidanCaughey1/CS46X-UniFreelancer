import React, { useState } from 'react';
import './LearningMaterialsInput.css';

function LearningMaterialsInput({ materials, setMaterials }) {
  const [activeTab, setActiveTab] = useState('readings');
  
  const [newReading, setNewReading] = useState({
    title: '',
    author: '',
    citation: '',
    link: ''
  });

  const [newPodcast, setNewPodcast] = useState({
    title: '',
    link: ''
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    link: ''
  });

  const addReading = () => {
    if (!newReading.title || !newReading.citation) {
      alert('Please fill in at least title and citation');
      return;
    }

    setMaterials({
      ...materials,
      readings: [...materials.readings, newReading]
    });

    setNewReading({ title: '', author: '', citation: '', link: '' });
  };

  const addPodcast = () => {
    if (!newPodcast.link) {
      alert('Please enter a podcast link');
      return;
    }

    setMaterials({
      ...materials,
      podcasts: [...materials.podcasts, newPodcast]
    });

    setNewPodcast({ title: '', link: '' });
  };

  const addVideo = () => {
    if (!newVideo.link) {
      alert('Please enter a video link');
      return;
    }

    setMaterials({
      ...materials,
      videos: [...materials.videos, newVideo]
    });

    setNewVideo({ title: '', link: '' });
  };

  const removeReading = (index) => {
    setMaterials({
      ...materials,
      readings: materials.readings.filter((_, i) => i !== index)
    });
  };

  const removePodcast = (index) => {
    setMaterials({
      ...materials,
      podcasts: materials.podcasts.filter((_, i) => i !== index)
    });
  };

  const removeVideo = (index) => {
    setMaterials({
      ...materials,
      videos: materials.videos.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="learning-materials-input">
      <div className="materials-tabs">
        <button 
          className={`tab ${activeTab === 'readings' ? 'active' : ''}`}
          onClick={() => setActiveTab('readings')}
        >
          📚 Readings ({materials.readings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'podcasts' ? 'active' : ''}`}
          onClick={() => setActiveTab('podcasts')}
        >
          🎧 Podcasts ({materials.podcasts.length})
        </button>
        <button 
          className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          🎥 Videos ({materials.videos.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'readings' && (
          <div className="readings-section">
            <h4>Add Reading Material</h4>
            
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newReading.title}
                onChange={(e) => setNewReading({ ...newReading, title: e.target.value })}
                placeholder="e.g., Contagious: Why Things Catch On"
              />
            </div>

            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                value={newReading.author}
                onChange={(e) => setNewReading({ ...newReading, author: e.target.value })}
                placeholder="e.g., Berger, J."
              />
            </div>

            <div className="form-group">
              <label>Citation/Chapter *</label>
              <input
                type="text"
                value={newReading.citation}
                onChange={(e) => setNewReading({ ...newReading, citation: e.target.value })}
                placeholder="e.g., Chapter 1 - Social Currency"
              />
            </div>

            <div className="form-group">
              <label>Link (optional)</label>
              <input
                type="url"
                value={newReading.link}
                onChange={(e) => setNewReading({ ...newReading, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <button type="button" onClick={addReading} className="add-material-button">
              + Add Reading
            </button>

            {materials.readings.length > 0 && (
              <div className="materials-list">
                {materials.readings.map((reading, index) => (
                  <div key={index} className="material-item">
                    <div className="material-info">
                      <strong>{reading.title}</strong>
                      {reading.author && <span className="author"> by {reading.author}</span>}
                      <div className="citation">{reading.citation}</div>
                      {reading.link && (
                        <a href={reading.link} target="_blank" rel="noopener noreferrer" className="material-link">
                          View Resource →
                        </a>
                      )}
                    </div>
                    <button onClick={() => removeReading(index)} className="remove-button-small">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'podcasts' && (
          <div className="podcasts-section">
            <h4>Add Podcast</h4>
            
            <div className="form-group">
              <label>Title (optional)</label>
              <input
                type="text"
                value={newPodcast.title}
                onChange={(e) => setNewPodcast({ ...newPodcast, title: e.target.value })}
                placeholder="e.g., The Q&A Episode"
              />
            </div>

            <div className="form-group">
              <label>Podcast Link *</label>
              <input
                type="url"
                value={newPodcast.link}
                onChange={(e) => setNewPodcast({ ...newPodcast, link: e.target.value })}
                placeholder="https://podcasts.apple.com/..."
              />
            </div>

            <button type="button" onClick={addPodcast} className="add-material-button">
              + Add Podcast
            </button>

            {materials.podcasts.length > 0 && (
              <div className="materials-list">
                {materials.podcasts.map((podcast, index) => (
                  <div key={index} className="material-item">
                    <div className="material-info">
                      {podcast.title && <strong>{podcast.title}</strong>}
                      <a href={podcast.link} target="_blank" rel="noopener noreferrer" className="material-link">
                        Listen to Podcast →
                      </a>
                    </div>
                    <button onClick={() => removePodcast(index)} className="remove-button-small">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="videos-section">
            <h4>Add Video</h4>
            
            <div className="form-group">
              <label>Title (optional)</label>
              <input
                type="text"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="e.g., Introduction to Social Currency"
              />
            </div>

            <div className="form-group">
              <label>Video Link *</label>
              <input
                type="url"
                value={newVideo.link}
                onChange={(e) => setNewVideo({ ...newVideo, link: e.target.value })}
                placeholder="https://youtu.be/..."
              />
            </div>

            <button type="button" onClick={addVideo} className="add-material-button">
              + Add Video
            </button>

            {materials.videos.length > 0 && (
              <div className="materials-list">
                {materials.videos.map((video, index) => (
                  <div key={index} className="material-item">
                    <div className="material-info">
                      {video.title && <strong>{video.title}</strong>}
                      <a href={video.link} target="_blank" rel="noopener noreferrer" className="material-link">
                        Watch Video →
                      </a>
                    </div>
                    <button onClick={() => removeVideo(index)} className="remove-button-small">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningMaterialsInput;