import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GradingInterface.css';

function GradingInterface() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Grades state: { partNumber: { points: number, comment: string } }
  const [grades, setGrades] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');

  const getPartAnswer = (partNumber) => {
    if (!submission?.partAnswers && !submission?.answers) return '';

    if (submission?.partAnswers && typeof submission.partAnswers.get === 'function') {
      return submission.partAnswers.get(String(partNumber)) || submission.partAnswers.get(partNumber) || '';
    }

    return (
      submission?.partAnswers?.[String(partNumber)] ||
      submission?.partAnswers?.[partNumber] ||
      submission?.answers?.[String(partNumber)] ||
      submission?.answers?.[partNumber] ||
      ''
    );
  };

  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/submissions/${submissionId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }

      const data = await response.json();
      setSubmission(data);

      // Initialize grades structure
      const initialGrades = {};
      if (data.assignmentData?.parts) {
        data.assignmentData.parts.forEach((part) => {
          const criterion = data.assignmentData.gradingCriteria.find(
            c => c.name.includes(`Part ${part.partNumber}`) || c.name.includes(part.title)
          );
          
          initialGrades[part.partNumber] = {
            points: 0,
            maxPoints: criterion?.points || 0,
            comment: ''
          };
        });
      }
      setGrades(initialGrades);

    } catch (err) {
      console.error('Error fetching submission:', err);
      alert('Failed to load submission');
      navigate('/instructor/dashboard');
    } finally {
      setLoading(false);
    }
  }, [navigate, submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleGradeChange = (partNumber, field, value) => {
    setGrades(prev => ({
      ...prev,
      [partNumber]: {
        ...prev[partNumber],
        [field]: field === 'points' ? Number(value) : value
      }
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(grades).reduce((sum, grade) => sum + (grade.points || 0), 0);
  };

  const calculateMaxScore = () => {
    return Object.values(grades).reduce((sum, grade) => sum + (grade.maxPoints || 0), 0);
  };

  const calculatePercentage = () => {
    const total = calculateTotalScore();
    const max = calculateMaxScore();
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  const handleSubmitGrade = async () => {
    // Validate all parts are graded
    const allPartsGraded = Object.values(grades).every(grade => 
      grade.points >= 0 && grade.points <= grade.maxPoints
    );

    if (!allPartsGraded) {
      alert('Please grade all parts before submitting');
      return;
    }

    // Confirm submission
    const percentage = calculatePercentage();
    const passed = percentage >= 70;
    const confirmMessage = `Submit grade: ${calculateTotalScore()}/${calculateMaxScore()} (${percentage}%)\n\nStatus: ${passed ? 'PASSED ✓' : 'NOT PASSED ✗'}\n\nAre you sure?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setGrading(true);

      const response = await fetch(`/api/instructor/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          grades,
          overallFeedback
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit grade');
      }

      alert('Grade submitted successfully!');
      navigate('/instructor/dashboard');

    } catch (err) {
      console.error('Error submitting grade:', err);
      alert('Failed to submit grade. Please try again.');
    } finally {
      setGrading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your grading progress will be lost.')) {
      navigate('/instructor/dashboard');
    }
  };

  const handleAiSuggestGrades = async () => {
    try {
      setAiLoading(true);

      const res = await fetch(`/api/ai/submissions/${submissionId}/suggest-grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "AI grading failed");
        return;
      }

      const nextGrades = {};
      for (const [partNum, g] of Object.entries(data.grades || {})) {
        nextGrades[Number(partNum)] = {
          points: Number(g.points) || 0,
          maxPoints: Number(g.maxPoints) || 0,
          comment: g.comment || "",
        };
      }

      if (Object.keys(nextGrades).length === 0) {
        alert('AI returned feedback, but no usable numeric grades. This provider may not be reliably returning structured scores yet.');
        return;
      }

      setGrades(prev => {
        const merged = { ...prev };

        for (const [partNum, grade] of Object.entries(nextGrades)) {
          merged[partNum] = {
            ...prev[partNum],
            ...grade,
            maxPoints: grade.maxPoints || prev[partNum]?.maxPoints || 0,
          };
        }

        return merged;
      });
      if (typeof data.overallFeedback === "string") setOverallFeedback(data.overallFeedback);

      if (Array.isArray(data.notes) && data.notes.length > 0) {
        console.warn('AI grading notes:', data.notes);
      }

    } catch (err) {
      console.error(err);
      alert("AI grading failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grading-interface-page">
        <div className="loading">Loading submission...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="grading-interface-page">
        <div className="error">Submission not found</div>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  const maxScore = calculateMaxScore();
  const percentage = calculatePercentage();
  const passed = percentage >= 70;

  return (
    <div className="grading-interface-page">
      <div className="grading-container">
        {/* Header */}
        <div className="grading-header">
          <button className="back-button" onClick={handleCancel}>
            ← Back to Dashboard
          </button>
          <button
            className="secondary-button"
            onClick={handleAiSuggestGrades}
            disabled={aiLoading || grading}
            style={{ marginLeft: "auto" }}
          >
            {aiLoading ? "Thinking..." : "✨ AI Suggest Grades"}
          </button>
          <h1>Grade Assignment</h1>
        </div>

        {/* Student & Course Info */}
        <div className="submission-info-card">
          <div className="info-section">
            <h3>Student Information</h3>
            <div className="info-row">
              <div className="student-profile">
                <div className="student-avatar-large">
                  {submission.student?.avatar ? (
                    <img src={submission.student.avatar} alt={submission.studentName} />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {submission.studentName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <strong className="student-name">{submission.studentName}</strong>
                  <span className="student-email">{submission.studentEmail}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Assignment Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Course:</span>
                <span className="detail-value">{submission.courseName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Module:</span>
                <span className="detail-value">{submission.moduleName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Assignment:</span>
                <span className="detail-value">{submission.assignmentTitle}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">
                  {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grading Sections */}
        <div className="grading-content">
          {/* Assignment Parts */}
          {submission.assignmentData?.parts?.map((part, index) => {
            const partNumber = part.partNumber;
            const studentAnswer = getPartAnswer(partNumber);
            const grade = grades[partNumber] || { points: 0, maxPoints: 0, comment: '' };

            return (
              <div key={index} className="grading-part-card">
                <div className="part-header">
                  <h3>Part {partNumber}: {part.title}</h3>
                  <span className="max-points-badge">
                    Max: {grade.maxPoints} pts
                  </span>
                </div>

                <div className="part-instructions">
                  <strong>Instructions:</strong>
                  <p>{part.instructions}</p>
                </div>

                <div className="student-answer-section">
                  <strong>Student's Answer:</strong>
                  <div className="student-answer-box">
                    {studentAnswer || <em className="no-answer">No answer provided</em>}
                  </div>
                </div>

                {/* File URL if provided */}
                {submission.fileUrl && index === 0 && (
                  <div className="file-url-section">
                    <strong>Attached File:</strong>
                    <a 
                      href={submission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      📎 View Submitted File →
                    </a>
                  </div>
                )}

                {/* Grading Inputs */}
                <div className="grading-inputs">
                  <div className="points-input-section">
                    <label>Grade (Points):</label>
                    <div className="points-input-group">
                      <input
                        type="number"
                        min="0"
                        max={grade.maxPoints}
                        value={grade.points}
                        onChange={(e) => handleGradeChange(partNumber, 'points', e.target.value)}
                        className="points-input"
                      />
                      <span className="points-max">/ {grade.maxPoints}</span>
                    </div>
                  </div>

                  <div className="comment-input-section">
                    <label>Feedback for this part:</label>
                    <textarea
                      value={grade.comment}
                      onChange={(e) => handleGradeChange(partNumber, 'comment', e.target.value)}
                      placeholder="Provide constructive feedback..."
                      rows={3}
                      className="comment-textarea"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Overall Feedback */}
          <div className="overall-feedback-card">
            <h3>Overall Feedback (Optional)</h3>
            <textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="Provide overall feedback on the assignment..."
              rows={5}
              className="overall-feedback-textarea"
            />
          </div>

          {/* Score Summary */}
          <div className="score-summary-card">
            <h3>Score Summary</h3>
            <div className="score-breakdown">
              {Object.entries(grades).map(([partNum, grade]) => (
                <div key={partNum} className="score-item">
                  <span>Part {partNum}</span>
                  <span className="score-value">
                    {grade.points} / {grade.maxPoints} pts
                  </span>
                </div>
              ))}
            </div>

            <div className="score-total">
              <div className="total-row">
                <strong>Total Score:</strong>
                <strong className="total-value">
                  {totalScore} / {maxScore} pts
                </strong>
              </div>
              <div className="percentage-row">
                <span>Percentage:</span>
                <span className={`percentage-value ${passed ? 'passed' : 'failed'}`}>
                  {percentage}%
                </span>
              </div>
              <div className="status-row">
                <span>Status:</span>
                <span className={`status-badge ${passed ? 'passed' : 'failed'}`}>
                  {passed ? '✓ PASSED' : '✗ NOT PASSED'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grading-actions">
            <button 
              className="cancel-button"
              onClick={handleCancel}
              disabled={grading}
            >
              Cancel
            </button>
            <button 
              className="submit-grade-button"
              onClick={handleSubmitGrade}
              disabled={grading}
            >
              {grading ? 'Submitting...' : 'Submit Grade'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradingInterface;
