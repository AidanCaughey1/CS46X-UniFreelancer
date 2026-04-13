import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GradingInterface.css';

function GradingInterface() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // For question-based: { questionNumber: { points: number, comment: string, autoGraded: boolean } }
  // For part-based: { partNumber: { points: number, maxPoints: number, comment: string } }
  const [grades, setGrades] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');

  const isQuestionBased = submission?.assignmentType === 'question-based';

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

      // Fetch course to get assignment questions
      if (data.assignmentType === 'question-based') {
        const courseRes = await fetch(`/api/academy/courses/${data.course}`, {
          credentials: 'include'
        });
        const course = await courseRes.json();
        setCourseData(course);

        // Find the module and assignment
        const module = course.modules.find(m => m._id === data.module);
        const assignment = module?.assignment;

        if (assignment?.questions) {
          // Auto-grade multiple-choice and true/false
          const initialGrades = {};
          
          assignment.questions.forEach((question) => {
            const studentAnswer = data.answers?.[question.questionNumber];
            let points = 0;
            let autoGraded = false;

            // Auto-grade multiple-choice and true/false
            if (question.type === 'multiple-choice' || question.type === 'true-false') {
              if (studentAnswer === question.correctAnswer) {
                points = question.points;
              }
              autoGraded = true;
            }

            initialGrades[question.questionNumber] = {
              points,
              maxPoints: question.points,
              comment: '',
              autoGraded
            };
          });

          setGrades(initialGrades);
        }
      } else {
        // Old part-based assignment
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
      }

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

  const handleGradeChange = (itemNumber, field, value) => {
    setGrades(prev => ({
      ...prev,
      [itemNumber]: {
        ...prev[itemNumber],
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
    // Validate all items are graded
    const allItemsGraded = Object.values(grades).every(grade => 
      grade.points >= 0 && grade.points <= grade.maxPoints
    );

    if (!allItemsGraded) {
      alert('Please grade all items before submitting');
      return;
    }

    // Confirm submission
    const percentage = calculatePercentage();
    const passed = percentage >= (submission.passingScore || 70);
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
      
  const renderQuestionAnswer = (question, studentAnswer) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="mc-answer-display">
            {question.options.map((option, idx) => (
              <div 
                key={idx} 
                className={`mc-option ${
                  idx === studentAnswer ? 'selected' : ''
                } ${
                  idx === question.correctAnswer ? 'correct' : ''
                } ${
                  idx === studentAnswer && idx !== question.correctAnswer ? 'incorrect' : ''
                }`}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}.</span>
                <span className="option-text">{option}</span>
                {idx === question.correctAnswer && <span className="correct-badge">✓ Correct</span>}
                {idx === studentAnswer && idx !== question.correctAnswer && <span className="incorrect-badge">✗ Incorrect</span>}
                {idx === studentAnswer && <span className="selected-badge">Student's Answer</span>}
              </div>
            ))}
          </div>
        );

      case 'true-false':
        const tfOptions = ['True', 'False'];
        return (
          <div className="tf-answer-display">
            {tfOptions.map((option, idx) => (
              <div 
                key={idx}
                className={`tf-option ${
                  idx === studentAnswer ? 'selected' : ''
                } ${
                  idx === question.correctAnswer ? 'correct' : ''
                } ${
                  idx === studentAnswer && idx !== question.correctAnswer ? 'incorrect' : ''
                }`}
              >
                <span className="option-text">{option}</span>
                {idx === question.correctAnswer && <span className="correct-badge">✓ Correct</span>}
                {idx === studentAnswer && idx !== question.correctAnswer && <span className="incorrect-badge">✗ Incorrect</span>}
                {idx === studentAnswer && <span className="selected-badge">Student's Answer</span>}
              </div>
            ))}
          </div>
        );

      case 'written':
        return (
          <div className="written-answer-display">
            <div className="answer-text">{studentAnswer || <em>No answer provided</em>}</div>
            {question.wordLimit > 0 && studentAnswer && (
              <div className="word-count-info">
                Word count: {studentAnswer.split(/\s+/).filter(w => w).length} / {question.wordLimit}
              </div>
            )}
            {question.rubric && (
              <div className="rubric-display">
                <strong>Grading Rubric:</strong>
                <p>{question.rubric}</p>
              </div>
            )}
          </div>
        );

      case 'matching':
        return (
          <div className="matching-answer-display">
            {question.matchPairs.map((pair, idx) => {
              const studentMatch = studentAnswer?.[idx];
              const isCorrect = studentMatch === pair.right;
              
              return (
                <div key={idx} className={`matching-pair ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <span className="match-left">{pair.left}</span>
                  <span className="match-arrow">→</span>
                  <span className="match-right">{studentMatch || <em>No answer</em>}</span>
                  {isCorrect ? (
                    <span className="correct-badge">✓</span>
                  ) : (
                    <span className="incorrect-info">
                      ✗ (Correct: {pair.right})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'pdf-upload':
        return (
          <div className="pdf-answer-display">
            {studentAnswer ? (
              <a href={studentAnswer} target="_blank" rel="noopener noreferrer" className="file-link">
                📎 View Submitted File →
              </a>
            ) : (
              <em>No file submitted</em>
            )}
            {question.fileRequirements && (
              <div className="file-requirements-display">
                <strong>Requirements:</strong>
                <p>{question.fileRequirements}</p>
              </div>
            )}
          </div>
        );

      default:
        return <div>{String(studentAnswer) || <em>No answer</em>}</div>;
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
  const passed = percentage >= (submission.passingScore || 70);

  // Get assignment questions if question-based
  const module = courseData?.modules?.find(m => m._id === submission.module);
  const assignment = module?.assignment;

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
          {isQuestionBased && (
            <span className="assignment-type-badge">Question-Based Assignment</span>
          )}
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
                      {submission.studentName?.charAt(0).toUpperCase()}
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

        {/* Grading Content */}
        <div className="grading-content">
          {/* QUESTION-BASED ASSIGNMENT */}
          {isQuestionBased && assignment?.questions && assignment.questions.map((question, index) => {
            const questionNumber = question.questionNumber;
            const studentAnswer = submission.answers?.[questionNumber];
            const grade = grades[questionNumber] || { points: 0, maxPoints: question.points, comment: '', autoGraded: false };

            return (
              <div key={index} className="grading-question-card">
                <div className="question-header-grade">
                  <div className="question-info">
                    <h3>Question {questionNumber}</h3>
                    <span className="question-type-badge-grade">{question.type}</span>
                    {grade.autoGraded && (
                      <span className="auto-graded-badge">🤖 Auto-Graded</span>
                    )}
                  </div>
                  <span className="max-points-badge">
                    Max: {question.points} pts
                  </span>
                </div>

                <div className="question-text-grade">
                  <strong>Question:</strong>
                  <p>{question.question}</p>
                </div>

                <div className="student-answer-section">
                  <strong>Student's Answer:</strong>
                  {renderQuestionAnswer(question, studentAnswer)}
                </div>

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
                        onChange={(e) => handleGradeChange(questionNumber, 'points', e.target.value)}
                        className="points-input"
                        disabled={grade.autoGraded}
                      />
                      <span className="points-max">/ {grade.maxPoints}</span>
                      {grade.autoGraded && (
                        <span className="auto-grade-note">(Auto-graded)</span>
                      )}
                    </div>
                  </div>

                  <div className="comment-input-section">
                    <label>Feedback for this question:</label>
                    <textarea
                      value={grade.comment}
                      onChange={(e) => handleGradeChange(questionNumber, 'comment', e.target.value)}
                      placeholder="Provide constructive feedback..."
                      rows={3}
                      className="comment-textarea"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* PART-BASED ASSIGNMENT (OLD) */}
          {!isQuestionBased && submission.assignmentData?.parts?.map((part, index) => {
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
              {Object.entries(grades).map(([itemNum, grade]) => (
                <div key={itemNum} className="score-item">
                  <span>{isQuestionBased ? `Question ${itemNum}` : `Part ${itemNum}`}</span>
                  <span className="score-value">
                    {grade.points} / {grade.maxPoints} pts
                    {grade.autoGraded && <span className="auto-badge-small">🤖</span>}
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
