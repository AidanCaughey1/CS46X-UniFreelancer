import React, { useState } from "react";

const inputClasses =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark";
const primaryButtonClasses =
  "inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-border px-4 py-3 text-sm font-semibold transition";
const removeButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-error/20 bg-[#fff2f2] px-4 py-2 text-sm font-semibold text-error transition hover:bg-[#ffe8e6]";

function LearningMaterialsInput({ materials, setMaterials }) {
  const [activeTab, setActiveTab] = useState("readings");
  const [newReading, setNewReading] = useState({
    title: "",
    author: "",
    citation: "",
    link: ""
  });
  const [newPodcast, setNewPodcast] = useState({
    title: "",
    link: ""
  });
  const [newVideo, setNewVideo] = useState({
    title: "",
    link: ""
  });

  const addReading = () => {
    if (!newReading.title || !newReading.citation) {
      alert("Please fill in at least title and citation");
      return;
    }

    setMaterials({
      ...materials,
      readings: [...materials.readings, newReading]
    });

    setNewReading({ title: "", author: "", citation: "", link: "" });
  };

  const addPodcast = () => {
    if (!newPodcast.link) {
      alert("Please enter a podcast link");
      return;
    }

    setMaterials({
      ...materials,
      podcasts: [...materials.podcasts, newPodcast]
    });

    setNewPodcast({ title: "", link: "" });
  };

  const addVideo = () => {
    if (!newVideo.link) {
      alert("Please enter a video link");
      return;
    }

    setMaterials({
      ...materials,
      videos: [...materials.videos, newVideo]
    });

    setNewVideo({ title: "", link: "" });
  };

  const removeReading = (index) => {
    setMaterials({
      ...materials,
      readings: materials.readings.filter((_, readingIndex) => readingIndex !== index)
    });
  };

  const removePodcast = (index) => {
    setMaterials({
      ...materials,
      podcasts: materials.podcasts.filter((_, podcastIndex) => podcastIndex !== index)
    });
  };

  const removeVideo = (index) => {
    setMaterials({
      ...materials,
      videos: materials.videos.filter((_, videoIndex) => videoIndex !== index)
    });
  };

  const tabs = [
    { id: "readings", label: "Readings", count: materials.readings.length },
    { id: "podcasts", label: "Podcasts", count: materials.podcasts.length },
    { id: "videos", label: "Videos", count: materials.videos.length }
  ];

  const renderEmptyState = (message) => (
    <div className="rounded-[24px] border border-dashed border-border bg-light-tertiary px-5 py-10 text-center text-sm text-dark-secondary">
      {message}
    </div>
  );

  const renderMaterialItem = ({ title, subtitle, linkLabel, link, onRemove }) => (
    <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-light-tertiary p-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        {title ? (
          <p className="text-sm font-semibold text-dark">{title}</p>
        ) : null}
        {subtitle ? <p className="text-sm text-dark-secondary">{subtitle}</p> : null}
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-accent transition hover:text-accent-tertiary"
          >
            {linkLabel}
          </a>
        ) : null}
      </div>

      <button type="button" onClick={onRemove} className={removeButtonClasses}>
        Remove
      </button>
    </div>
  );

  return (
    <div className="space-y-6 rounded-[28px] border border-border bg-white p-5">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={`${secondaryButtonClasses} ${
                isActive
                  ? "bg-dark text-white shadow-md"
                  : "bg-light-tertiary text-dark hover:bg-light-secondary"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {activeTab === "readings" ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-2xl font-bold text-dark">Add Reading Material</h4>
            <p className="mt-2 text-sm leading-7 text-dark-secondary">
              Include book chapters, articles, or reference notes for this module.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Title *
              </label>
              <input
                type="text"
                value={newReading.title}
                onChange={(event) =>
                  setNewReading((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="e.g., Contagious: Why Things Catch On"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Author
              </label>
              <input
                type="text"
                value={newReading.author}
                onChange={(event) =>
                  setNewReading((prev) => ({ ...prev, author: event.target.value }))
                }
                placeholder="e.g., Berger, J."
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Citation or Chapter *
              </label>
              <input
                type="text"
                value={newReading.citation}
                onChange={(event) =>
                  setNewReading((prev) => ({
                    ...prev,
                    citation: event.target.value
                  }))
                }
                placeholder="e.g., Chapter 1 - Social Currency"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Link (optional)
              </label>
              <input
                type="url"
                value={newReading.link}
                onChange={(event) =>
                  setNewReading((prev) => ({ ...prev, link: event.target.value }))
                }
                placeholder="https://..."
                className={inputClasses}
              />
            </div>
          </div>

          <button type="button" onClick={addReading} className={primaryButtonClasses}>
            Add Reading
          </button>

          <div className="space-y-4">
            {materials.readings.length === 0
              ? renderEmptyState("No reading materials added yet.")
              : materials.readings.map((reading, index) =>
                  renderMaterialItem({
                    title: reading.title,
                    subtitle: [reading.author ? `By ${reading.author}` : null, reading.citation]
                      .filter(Boolean)
                      .join(" | "),
                    linkLabel: "View Resource",
                    link: reading.link,
                    onRemove: () => removeReading(index)
                  })
                )}
          </div>
        </div>
      ) : null}

      {activeTab === "podcasts" ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-2xl font-bold text-dark">Add Podcast</h4>
            <p className="mt-2 text-sm leading-7 text-dark-secondary">
              Add an episode learners should listen to before or after the lesson.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Title (optional)
              </label>
              <input
                type="text"
                value={newPodcast.title}
                onChange={(event) =>
                  setNewPodcast((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="e.g., The Q and A Episode"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Podcast Link *
              </label>
              <input
                type="url"
                value={newPodcast.link}
                onChange={(event) =>
                  setNewPodcast((prev) => ({ ...prev, link: event.target.value }))
                }
                placeholder="https://podcasts.apple.com/..."
                className={inputClasses}
              />
            </div>
          </div>

          <button type="button" onClick={addPodcast} className={primaryButtonClasses}>
            Add Podcast
          </button>

          <div className="space-y-4">
            {materials.podcasts.length === 0
              ? renderEmptyState("No podcasts added yet.")
              : materials.podcasts.map((podcast, index) =>
                  renderMaterialItem({
                    title: podcast.title || "Podcast Link",
                    subtitle: podcast.link,
                    linkLabel: "Listen to Podcast",
                    link: podcast.link,
                    onRemove: () => removePodcast(index)
                  })
                )}
          </div>
        </div>
      ) : null}

      {activeTab === "videos" ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-2xl font-bold text-dark">Add Video</h4>
            <p className="mt-2 text-sm leading-7 text-dark-secondary">
              Add optional supporting videos for the module.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Title (optional)
              </label>
              <input
                type="text"
                value={newVideo.title}
                onChange={(event) =>
                  setNewVideo((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="e.g., Introduction to Social Currency"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Video Link *
              </label>
              <input
                type="url"
                value={newVideo.link}
                onChange={(event) =>
                  setNewVideo((prev) => ({ ...prev, link: event.target.value }))
                }
                placeholder="https://youtu.be/..."
                className={inputClasses}
              />
            </div>
          </div>

          <button type="button" onClick={addVideo} className={primaryButtonClasses}>
            Add Video
          </button>

          <div className="space-y-4">
            {materials.videos.length === 0
              ? renderEmptyState("No videos added yet.")
              : materials.videos.map((video, index) =>
                  renderMaterialItem({
                    title: video.title || "Video Link",
                    subtitle: video.link,
                    linkLabel: "Watch Video",
                    link: video.link,
                    onRemove: () => removeVideo(index)
                  })
                )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default LearningMaterialsInput;
