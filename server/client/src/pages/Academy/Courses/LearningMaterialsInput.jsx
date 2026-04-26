import React, { useState } from 'react';

function LearningMaterialsInput({ materials, setMaterials, showAlert }) {
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
      showAlert('Validation Error', 'Please fill in at least title and citation');
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
      showAlert('Validation Error', 'Please enter a podcast link');
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
      showAlert('Validation Error', 'Please enter a video link');
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
    <div className="mt-6 rounded-[28px] border border-border bg-white p-5 lg:p-6 shadow-sm">
      <div className="flex flex-wrap gap-3 border-b border-border pb-5">
        <button 
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === 'readings' 
              ? "bg-dark text-white shadow-md" 
              : "bg-light-tertiary text-dark hover:-translate-y-0.5 hover:bg-light-secondary"
          }`}
          onClick={() => setActiveTab('readings')}
        >
          📚 Readings ({materials.readings.length})
        </button>
        <button 
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === 'podcasts' 
              ? "bg-dark text-white shadow-md" 
              : "bg-light-tertiary text-dark hover:-translate-y-0.5 hover:bg-light-secondary"
          }`}
          onClick={() => setActiveTab('podcasts')}
        >
          🎧 Podcasts ({materials.podcasts.length})
        </button>
        <button 
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === 'videos' 
              ? "bg-dark text-white shadow-md" 
              : "bg-light-tertiary text-dark hover:-translate-y-0.5 hover:bg-light-secondary"
          }`}
          onClick={() => setActiveTab('videos')}
        >
          🎥 Videos ({materials.videos.length})
        </button>
      </div>

      <div className="pt-5">
        {activeTab === 'readings' && (
          <div className="space-y-5">
            <h4 className="text-lg font-bold text-dark mb-4">Add Reading Material</h4>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Title *</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="text"
                value={newReading.title}
                onChange={(e) => setNewReading({ ...newReading, title: e.target.value })}
                placeholder="e.g., Contagious: Why Things Catch On"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Author</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="text"
                value={newReading.author}
                onChange={(e) => setNewReading({ ...newReading, author: e.target.value })}
                placeholder="e.g., Berger, J."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Citation/Chapter *</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="text"
                value={newReading.citation}
                onChange={(e) => setNewReading({ ...newReading, citation: e.target.value })}
                placeholder="e.g., Chapter 1 - Social Currency"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Link (optional)</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="url"
                value={newReading.link}
                onChange={(e) => setNewReading({ ...newReading, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <button 
              type="button" 
              onClick={addReading} 
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary"
            >
              + Add Reading
            </button>

            {materials.readings.length > 0 && (
              <div className="mt-4 space-y-3">
                {materials.readings.map((reading, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-2xl border border-border bg-light-tertiary px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <strong className="text-dark block">{reading.title}</strong>
                      {reading.author && <span className="text-dark-secondary text-sm block">by {reading.author}</span>}
                      <div className="text-dark-secondary text-sm mt-1">{reading.citation}</div>
                      {reading.link && (
                        <a href={reading.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-tertiary text-sm font-semibold mt-1 inline-block transition-colors">
                          View Resource →
                        </a>
                      )}
                    </div>
                    <button 
                      onClick={() => removeReading(index)} 
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                      title="Remove Reading"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'podcasts' && (
          <div className="space-y-5">
            <h4 className="text-lg font-bold text-dark mb-4">Add Podcast</h4>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Title (optional)</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="text"
                value={newPodcast.title}
                onChange={(e) => setNewPodcast({ ...newPodcast, title: e.target.value })}
                placeholder="e.g., The Q&A Episode"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Podcast Link *</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="url"
                value={newPodcast.link}
                onChange={(e) => setNewPodcast({ ...newPodcast, link: e.target.value })}
                placeholder="https://podcasts.apple.com/..."
              />
            </div>

            <button 
              type="button" 
              onClick={addPodcast} 
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary"
            >
              + Add Podcast
            </button>

            {materials.podcasts.length > 0 && (
              <div className="mt-4 space-y-3">
                {materials.podcasts.map((podcast, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-2xl border border-border bg-light-tertiary px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      {podcast.title && <strong className="text-dark block mb-1">{podcast.title}</strong>}
                      <a href={podcast.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-tertiary text-sm font-semibold inline-block transition-colors">
                        Listen to Podcast →
                      </a>
                    </div>
                    <button 
                      onClick={() => removePodcast(index)} 
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                      title="Remove Podcast"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-5">
            <h4 className="text-lg font-bold text-dark mb-4">Add Video</h4>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Title (optional)</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="text"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="e.g., Introduction to Social Currency"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Video Link *</label>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                type="url"
                value={newVideo.link}
                onChange={(e) => setNewVideo({ ...newVideo, link: e.target.value })}
                placeholder="https://youtu.be/..."
              />
            </div>

            <button 
              type="button" 
              onClick={addVideo} 
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary"
            >
              + Add Video
            </button>

            {materials.videos.length > 0 && (
              <div className="mt-4 space-y-3">
                {materials.videos.map((video, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-2xl border border-border bg-light-tertiary px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      {video.title && <strong className="text-dark block mb-1">{video.title}</strong>}
                      <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-tertiary text-sm font-semibold inline-block transition-colors">
                        Watch Video →
                      </a>
                    </div>
                    <button 
                      onClick={() => removeVideo(index)} 
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                      title="Remove Video"
                    >
                      ✕
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