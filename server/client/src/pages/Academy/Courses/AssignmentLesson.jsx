import React, { useState, useEffect } from 'react';
import './CourseLearning.css';

function AssignmentLesson({ courseId, lesson, onComplete, progress }) {
  const [answers, setAnswers] = useState({});
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const assignment = lesson.assignmentData;
  const isQuestionBased = assignment?.questions && assignment.questions.length > 0;

  useEffect(() => {
    const existingSubmission = progress?.assignmentSubmissions?.find(
      sub => sub.lessonId?.toString() === lesson._id?.toString()
    );

    if (
      existingSubmission ||
      progress?.completedLessons?.some(id => id?.toString() === lesson._id?.toString())
    ) {
      setSubmitted(true);
    }
  }, [progress, lesson._id]);

  const handleAnswerChange = (questionNumber, answer) => {
    setAnswers({
      ...answers,
      [questionNumber]: answer
    });
  };

  const handleMatchingChange = (questionNumber, pairIndex, value) => {
    const currentAnswer = answers[questionNumber] || {};
    setAnswers({
      ...answers,
      [questionNumber]: {
        ...currentAnswer,
        [pairIndex]: value
      }
    });
  };

  const buildQuestionSubmission = () => {
    const normalizedPartAnswers = assignment.questions.reduce((acc, question, index) => {
      const partNumber = question.questionNumber || index + 1;
      const rawAnswer = answers[partNumber];

      if (rawAnswer === undefined || rawAnswer === null) {
        acc[partNumber] = '';
        return acc;
      }

      if (question.type === 'multiple-choice') {
        acc[partNumber] = question.options?.[rawAnswer] ?? String(rawAnswer);
        return acc;
      }

      if (question.type === 'true-false') {
        acc[partNumber] = rawAnswer === 0 ? 'True' : 'False';
        return acc;
      }

      if (question.type === 'matching') {
        acc[partNumber] = Object.entries(rawAnswer)
          .map(([pairIndex, selectedValue]) => {
            const leftLabel = question.matchPairs?.[Number(pairIndex)]?.left || `Item ${Number(pairIndex) + 1}`;
            return `${leftLabel} -> ${selectedValue}`;
          })
          .join('\n');
        return acc;
      }

      acc[partNumber] = typeof rawAnswer === 'string'
        ? rawAnswer
        : JSON.stringify(rawAnswer, null, 2);

      return acc;
    }, {});

    return {
      answers,
      partAnswers: normalizedPartAnswers,
      textSubmission: Object.entries(normalizedPartAnswers)
        .map(([partNum, answer]) => `Part ${partNum}: ${answer}`)
        .join('\n\n')
    };
  };

  const handleSubmit = async () => {
    if (!isQuestionBased) {
      if (!fileUrl.trim()) {
        alert('Please provide a file URL or link to your submission');
        return;
      }
    } else {
      const unansweredQuestions = assignment.questions.filter(q => {
        const answer = answers[q.questionNumber];

        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          return answer === undefined || answer === null;
        }
        if (q.type === 'written') {
          return !answer || answer.trim() === '';
        }
        if (q.type === 'matching') {
          const pairs = assignment.questions.find(aq => aq.questionNumber === q.questionNumber)?.matchPairs || [];
          return !answer || Object.keys(answer).length < pairs.length;
        }
        if (q.type === 'pdf-upload') {
          return !answer || answer.trim() === '';
        }
        return false;
      });

      if (unansweredQuestions.length > 0) {
        alert(`Please answer all questions. Missing: Question ${unansweredQuestions.map(q => q.questionNumber).join(', ')}`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const questionSubmission = isQuestionBased ? buildQuestionSubmission() : null;

      const submissionData = isQuestionBased
        ? {
            courseId,
            moduleId: lesson._id.split('-')[0],
            assignmentId: lesson._id,
            answers: questionSubmission.answers,
            partAnswers: questionSubmission.partAnswers,
            textSubmission: questionSubmission.textSubmission,
            submittedAt: new Date()
          }
        : {
            courseId,
            moduleId: lesson._id.split('-')[0],
            assignmentId: lesson._id,
            fileUrl,
            submittedAt: new Date()
          };

      const res = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submissionData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      alert('Assignment submitted successfully!');
      setSubmitted(true);
      onComplete();

    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert(err.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="assignment-lesson">
        <h2>{lesson.title}</h2>
        <div className="assignment-submitted">
          <div className="success-message">
            ✅ Assignment Submitted
          </div>
          <p>Your assignment has been submitted and is awaiting review from your instructor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-lesson">
      <h2>{lesson.title}</h2>

      <div className="assignment-content-wrapper">
        <div className="assignment-instructions">
          <h3>Assignment Instructions:</h3>
          <p>{assignment?.instructions || assignment?.purpose || 'Complete all questions below'}</p>
        </div>

        {isQuestionBased && (
          <div className="assignment-questions">
            {assignment.questions.map((question, index) => (
              <div key={index} className="assignment-question">
                <div className="question-header">
                  <span className="question-number">Question {question.questionNumber}</span>
                  <span className="question-type-badge">{question.type}</span>
                  <span className="question-points">{question.points} pts</span>
                </div>

                <p className="question-text">{question.question}</p>

                {question.type === 'multiple-choice' && (
                  <div className="question-options">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="option-label">
                        <input
                          type="radio"
                          name={`question-${question.questionNumber}`}
                          value={optIndex}
                          checked={answers[question.questionNumber] === optIndex}
                          onChange={() => handleAnswerChange(question.questionNumber, optIndex)}
                        />
                        <span className="option-text">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'true-false' && (
                  <div className="question-options">
                    <label className="option-label">
                      <input
                        type="radio"
                        name={`question-${question.questionNumber}`}
                        value={0}
                        checked={answers[question.questionNumber] === 0}
                        onChange={() => handleAnswerChange(question.questionNumber, 0)}
                      />
                      <span className="option-text">True</span>
                    </label>
                    <label className="option-label">
                      <input
                        type="radio"
                        name={`question-${question.questionNumber}`}
                        value={1}
                        checked={answers[question.questionNumber] === 1}
                        onChange={() => handleAnswerChange(question.questionNumber, 1)}
                      />
                      <span className="option-text">False</span>
                    </label>
                  </div>
                )}

                {question.type === 'written' && (
                  <div className="written-response">
                    <textarea
                      value={answers[question.questionNumber] || ''}
                      onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={6}
                      maxLength={question.wordLimit > 0 ? question.wordLimit * 6 : undefined}
                    />
                    {question.wordLimit > 0 && (
                      <div className="word-count">
                        Word limit: {question.wordLimit} words
                        {answers[question.questionNumber] && (
                          <span> ({answers[question.questionNumber].split(/\s+/).filter(w => w).length} / {question.wordLimit})</span>
                        )}
                      </div>
                    )}
                    {question.rubric && (
                      <div className="rubric-info">
                        <strong>Grading Rubric:</strong>
                        <p>{question.rubric}</p>
                      </div>
                    )}
                  </div>
                )}

                {question.type === 'matching' && (
                  <div className="matching-question">
                    <p className="matching-instructions">Match each item on the left with the correct item on the right:</p>
                    {question.matchPairs.map((pair, pairIndex) => (
                      <div key={pairIndex} className="matching-pair">
                        <div className="matching-left">{pair.left}</div>
                        <span className="matching-arrow">→</span>
                        <select
                          value={answers[question.questionNumber]?.[pairIndex] || ''}
                          onChange={(e) => handleMatchingChange(question.questionNumber, pairIndex, e.target.value)}
                          className="matching-select"
                        >
                          <option value="">Select match...</option>
                          {question.matchPairs.map((p, i) => (
                            <option key={i} value={p.right}>{p.right}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'pdf-upload' && (
                  <div className="pdf-upload">
                    {question.fileRequirements && (
                      <div className="file-requirements">
                        <strong>File Requirements:</strong>
                        <p>{question.fileRequirements}</p>
                      </div>
                    )}
                    <input
                      type="text"
                      value={answers[question.questionNumber] || ''}
                      onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                      placeholder="Paste link to your file (Google Drive, Dropbox, etc.)"
                      className="file-url-input"
                    />
                    <p className="file-help-text">Upload your file to Google Drive, Dropbox, or another cloud service, then paste the shareable link here.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isQuestionBased && (
          <div className="part-based-assignment">
            {assignment.parts && assignment.parts.map((part, index) => (
              <div key={index} className="assignment-part">
                <h4>Part {part.partNumber}: {part.title}</h4>
                <p>{part.instructions}</p>
              </div>
            ))}

            <div className="file-submission">
              <label>Attach File URL (optional)</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://docs.google.com/..."
                className="file-url-input"
              />
              <p className="file-help-text">Paste a link to Google Doc, Dropbox file, etc.</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="submit-assignment-button"
        >
          {submitting ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </div>
  );
}

export default AssignmentLesson;