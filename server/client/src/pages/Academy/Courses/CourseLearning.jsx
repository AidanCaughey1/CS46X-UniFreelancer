/* global process */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import CourseSidebar from './CourseSidebar';
import VideoLesson from './VideoLesson';
import AssignmentLesson from './AssignmentLesson';
import ReadingLesson from './ReadingLesson';
import PodcastLesson from './PodcastLesson';
import QuizLesson from './QuizLesson';
import FinalTest from './FinalTest';
import CourseCompleteModal from './CourseCompleteModal';
import './CourseLearning.css';

function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFinalTest, setShowFinalTest] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // --- Learning time tracking (per-course + overall) ---
  useEffect(() => {
    let startMs = Date.now();
    let flushed = false;

    const flush = async (reason) => {
      if (flushed) return;
      flushed = true;

      const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
      if (elapsedSec <= 0) return;

      const payload = JSON.stringify({ courseId: id, elapsedSec, reason });

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/learning/track",
            new Blob([payload], { type: "application/json" })
          );
          return;
        }
      } catch (e) {
        // fall through to fetch
      }

      try {
        await fetch("/api/learning/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: payload
        });
      } catch (err) {
        console.log("Failed to track time", err);
      }
    };

    const onVisibilityChange = () => {
      // If user leaves tab while on this learning page, flush
      if (document.visibilityState === "hidden") {
        flush("hidden");
      }
    };

    const onBeforeUnload = () => {
      flush("unload");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      flush("unmount"); // leaving CourseLearning route
    };
  }, [id]);

  // Convert academic structure to lessons
  const generateLessonsFromModule = (module) => {
    const lessons = [];
    let order = 0;

    // Add video lessons from learning materials
    if (module.learningMaterials?.videos) {
      module.learningMaterials.videos.forEach((video, index) => {
        lessons.push({
          _id: `${module._id}-video-${index}`,
          type: 'video',
          title: video.title || `Video ${index + 1}`,
          videoUrl: video.link,
          order: order++,
          duration: video.duration || ''
        });
      });
    }

    // Add reading lessons from learning materials
    if (module.learningMaterials?.readings) {
      module.learningMaterials.readings.forEach((reading, index) => {
        lessons.push({
          _id: `${module._id}-reading-${index}`,
          type: 'reading',
          title: reading.title || `Reading ${index + 1}`,
          order: order++,
          readingData: reading
        });
      });
    }

    // Add podcast lessons from learning materials
    if (module.learningMaterials?.podcasts) {
      module.learningMaterials.podcasts.forEach((podcast, index) => {
        lessons.push({
          _id: `${module._id}-podcast-${index}`,
          type: 'podcast',
          title: podcast.title || `Podcast ${index + 1}`,
          order: order++,
          podcastData: podcast
        });
      });
    }

    // Add assignment lesson if exists
    if (module.assignment) {
      lessons.push({
        _id: `${module._id}-assignment`,
        type: 'assignment',
        title: module.assignment.title,
        order: order++,
        assignmentType: 'both',
        instructions: module.assignment.purpose,
        assignmentData: module.assignment
      });
    }

    // Keep existing lessons if any (for old course structure)
    if (module.lessons && module.lessons.length > 0) {
      module.lessons.forEach(lesson => {
        lessons.push(lesson);
      });
    }

    return lessons;
  };

  // Fetch course and progress
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        setLoading(true);

        // Fetch course
        const courseRes = await fetch(`/api/academy/courses/${id}`);
        if (!courseRes.ok) throw new Error('Course not found');
        const courseData = await courseRes.json();
        
        // Add generated lessons to each module
        courseData.modules = courseData.modules.map(module => ({
          ...module,
          lessons: generateLessonsFromModule(module)
        }));
        
        setCourse(courseData);

        // Fetch progress
        const progressRes = await fetch(`/api/courses/${id}/progress`, {
          credentials: 'include'
        });
        const progressData = await progressRes.json();
        setProgress(progressData);

        // Set initial lesson
        if (progressData.currentLessonId && progressData.currentModuleId) {
          const module = courseData.modules.find(
            m => m._id === progressData.currentModuleId
          );
          const lesson = module?.lessons.find(
            l => l._id === progressData.currentLessonId
          );
          
          if (module && lesson) {
            setCurrentModule(module);
            setCurrentLesson(lesson);
          } else {
            startFromBeginning(courseData);
          }
        } else {
          startFromBeginning(courseData);
        }

      } catch (err) {
        console.error('Error loading course:', err);
        alert('Failed to load course');
        navigate('/academy/my-courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [id, navigate]);

  const startFromBeginning = (courseData) => {
    if (courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
      setCurrentModule(courseData.modules[0]);
      setCurrentLesson(courseData.modules[0].lessons[0]);
    }
  };

  const updatePosition = async (moduleId, lessonId) => {
    try {
      await fetch(`/api/courses/${id}/progress/position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ moduleId, lessonId })
      });
    } catch (err) {
      console.error('Error updating position:', err);
    }
  };

  const handleLessonSelect = (module, lesson) => {
    // Check if lesson is locked
    const allLessons = getAllLessonsInOrder();
    const currentLessonIndex = allLessons.findIndex(
      l => l.lesson._id === lesson._id
    );

    if (currentLessonIndex > 0) {
      const previousLessons = allLessons.slice(0, currentLessonIndex);
      const allPreviousCompleted = previousLessons.every(l =>
        progress.completedLessons?.includes(l.lesson._id)
      );

      if (!allPreviousCompleted) {
        alert('Please complete previous lessons first');
        return;
      }
    }

    setCurrentModule(module);
    setCurrentLesson(lesson);
    updatePosition(module._id, lesson._id);
  };

  const getAllLessonsInOrder = () => {
    const lessons = [];
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        lessons.push({ module, lesson });
      });
    });
    return lessons;
  };

  const handleNext = () => {
    const allLessons = getAllLessonsInOrder();
    const currentIndex = allLessons.findIndex(
      l => l.lesson._id === currentLesson._id
    );

    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1];
      setCurrentModule(next.module);
      setCurrentLesson(next.lesson);
      updatePosition(next.module._id, next.lesson._id);
    } else {
      if (course.finalTest && course.finalTest.questions.length > 0) {
        setShowFinalTest(true);
      } else {
        setShowCompleteModal(true);
      }
    }
  };

  const handlePrevious = () => {
    const allLessons = getAllLessonsInOrder();
    const currentIndex = allLessons.findIndex(
      l => l.lesson._id === currentLesson._id
    );

    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1];
      setCurrentModule(prev.module);
      setCurrentLesson(prev.lesson);
      updatePosition(prev.module._id, prev.lesson._id);
    }
  };

  const handleLessonComplete = async () => {
    try {
      const res = await fetch(
        `/api/courses/${id}/progress/lesson/${currentLesson._id}/complete`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const data = await res.json();
      setProgress(data.progress);

      handleNext();

    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const handleTestComplete = (passed) => {
    if (passed) {
      setShowCompleteModal(true);
    }
    setShowFinalTest(false);
  };

  const handleExit = () => {
    navigate('/academy/my-courses');
  };

  if (loading) {
    return (
      <div className="course-learning-page">
        <div className="loading">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-learning-page">
        <div className="error">Course not found</div>
      </div>
    );
  }

  const allLessons = getAllLessonsInOrder();
  const currentIndex = allLessons.findIndex(
    l => l.lesson._id === currentLesson?._id
  );

  return (
    <div className="course-learning-page">
      <div className="course-learning-header">
        <button className="exit-button" onClick={handleExit}>
          <FiArrowLeft size={18} /> Exit Course
        </button>
        <h1>{course.title}</h1>
        <div className="progress-info">
          {progress?.completedLessons?.length || 0} / {allLessons.length} Complete
          <span className="progress-percentage">
            {progress?.progressPercentage || 0}%
          </span>
        </div>
      </div>

      <div className="course-learning-container">
        <CourseSidebar
          course={course}
          progress={progress}
          currentLesson={currentLesson}
          onLessonSelect={handleLessonSelect}
        />

        <div className="course-learning-main">
          {showFinalTest ? (
            <FinalTest
              courseId={id}
              finalTest={course.finalTest}
              onComplete={handleTestComplete}
            />
          ) : currentLesson ? (
            <>
              {currentLesson.type === 'video' && (
                <VideoLesson
                  lesson={currentLesson}
                  onComplete={handleLessonComplete}
                  isCompleted={progress?.completedLessons?.includes(currentLesson._id)}
                />
              )}

              {currentLesson.type === 'assignment' && (
                <AssignmentLesson
                  courseId={id}
                  lesson={currentLesson}
                  onComplete={handleLessonComplete}
                  progress={progress}
                />
              )}

              {currentLesson.type === 'reading' && (
                <ReadingLesson
                  lesson={currentLesson}
                  onComplete={handleLessonComplete}
                  isCompleted={progress?.completedLessons?.includes(currentLesson._id)}
                />
              )}

              {currentLesson.type === 'podcast' && (
                <PodcastLesson
                  lesson={currentLesson}
                  onComplete={handleLessonComplete}
                  isCompleted={progress?.completedLessons?.includes(currentLesson._id)}
                />
              )}

              {currentLesson.type === 'quiz' && (
                <QuizLesson
                  courseId={id}
                  lesson={currentLesson}
                  onComplete={handleLessonComplete}
                  progress={progress}
                />
              )}

              <div className="lesson-navigation">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="nav-button prev-button"
                >
                  <FiArrowLeft size={18} /> Previous
                </button>

                <button
                  onClick={handleNext}
                  className="nav-button next-button"
                >
                  {currentIndex === allLessons.length - 1
                    ? 'Go to Final Test →'
                    : 'Next Lesson'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-lesson">
              Select a lesson from the sidebar to begin
            </div>
          )}
        </div>
      </div>

      {showCompleteModal && (
        <CourseCompleteModal
          course={course}
          badge={course.badge}
          onClose={() => {
            setShowCompleteModal(false);
            navigate('/academy/my-courses');
          }}
        />
      )}
    </div>
  );
}

export default CourseLearning;
