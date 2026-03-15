import React, { useState } from 'react';
import './CourseLearning.css';

function AssignmentLesson({ courseId, lesson, onComplete, progress }) {
  const assignmentData = lesson.assignmentData;
  
  // Initialize state for each part
  const [partAnswers, setPartAnswers] = useState(
    assignmentData?.parts?.reduce((acc, part) => {
      acc[part.partNumber] = '';
      return acc;
    }, {}) || {}
  );
  
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if already submitted
  const existingSubmission = progress?.assignmentSubmissions?.find(
    sub => sub.lessonId?.toString() === lesson._id?.toString()
  );

  const handlePartChange = (partNumber, value) => {
    setPartAnswers(prev => ({
      ...prev,
      [partNumber]: value
    }));
  };

  const handleSubmit = async () => {
    const allPartsFilled = Object.values(partAnswers).every(answer => answer.trim());

    if (!allPartsFilled) {
      alert('Please complete all parts of the assignment');
      return;
    }

    try {
      setSubmitting(true);

      const combinedSubmission = Object.entries(partAnswers)
        .map(([partNum, answer]) => `Part ${partNum}: ${answer}`)
        .join('\n\n');

      console.log("Submitting assignment with lesson._id:", lesson._id);
      console.log("Submitting assignment payload:", {
        textSubmission: combinedSubmission,
        fileUrl,
        partAnswers
      });

      const res = await fetch(
        `/api/courses/${courseId}/progress/assignment/${lesson._id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            textSubmission: combinedSubmission,
            fileUrl,
            partAnswers
          })
        }
      );

      const data = await res.json();
      console.log("Assignment submit response:", data);

      if (res.ok) {
        alert('Assignment submitted successfully!');
        onComplete();
      } else {
        alert(data.error || 'Failed to submit assignment');
      }

    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (existingSubmission) {
    return (
      <div className="assignment-lesson">
        <div className="lesson-header">
          <h2>📝 {lesson.title}</h2>
        </div>
        <div className="submitted-badge-large">
          ✅ Assignment Submitted
        </div>
        {existingSubmission.textSubmission && (
          <div className="submission-view">
            <h4>Your Submission:</h4>
            <pre className="submission-text">{existingSubmission.textSubmission}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="assignment-lesson">
      <div className="lesson-header">
        <h2>📝 {lesson.title}</h2>
        <span className="duration-badge">{lesson.duration || '45 min'}</span>
      </div>

      <div className="assignment-content">
        {/* Lesson Content Box */}
        <div className="lesson-content-box">
          <h3>Lesson Content</h3>
          <p>{assignmentData?.purpose || lesson.instructions}</p>
        </div>

        {/* Assignment Instructions Box */}
        {assignmentData?.instructions && (
          <div className="assignment-instructions-box">
            <h3>Assignment Instructions:</h3>
            <p>{assignmentData.instructions}</p>
          </div>
        )}

        {/* Assignment Parts with Input Fields */}
        {assignmentData?.parts && assignmentData.parts.length > 0 && (
          <div className="assignment-parts-input">
            {assignmentData.parts.map((part, index) => (
              <div key={index} className="part-input-section">
                <h4>Part {part.partNumber}: {part.title}</h4>
                <p className="part-instructions">{part.instructions}</p>
                
                <textarea
                  value={partAnswers[part.partNumber] || ''}
                  onChange={(e) => handlePartChange(part.partNumber, e.target.value)}
                  placeholder="Enter your answer here..."
                  rows={4}
                  className="part-input-field"
                />
              </div>
            ))}
          </div>
        )}

        {/* Grading Criteria */}
        {assignmentData?.gradingCriteria && assignmentData.gradingCriteria.length > 0 && (
          <div className="grading-display">
            <h3>Grading Criteria</h3>
            <ul>
              {assignmentData.gradingCriteria.map((criterion, index) => (
                <li key={index}>
                  <strong>{criterion.name}</strong> - {criterion.points} points
                </li>
              ))}
            </ul>
            <div className="total-points-display">
              Total Points: {assignmentData.gradingCriteria.reduce((sum, c) => sum + c.points, 0)}
            </div>
          </div>
        )}

        {/* Deliverable Format */}
        {assignmentData?.deliverableFormat && (
          <div className="deliverable-info">
            <strong>Deliverable Format:</strong> {assignmentData.deliverableFormat}
          </div>
        )}

        {/* Optional File URL */}
        <div className="file-url-section">
          <label>Attach File URL (optional)</label>
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://docs.google.com/..."
            className="file-url-input"
          />
          <small>Paste a link to Google Doc, Dropbox file, etc.</small>
        </div>

        {/* Submit Button */}
        <div className="assignment-submit-section">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignmentLesson;