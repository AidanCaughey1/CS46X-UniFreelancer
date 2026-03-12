import React, { useState } from 'react';
import './CourseLearning.css';

function QuizLesson({ courseId, lesson, onComplete, progress }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Check if already passed
  const existingResult = progress?.quizResults?.find(
    qr => qr.lessonId === lesson._id && qr.passed
  );

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = async () => {
    // Validate all questions answered
    if (Object.keys(answers).length < lesson.questions.length) {
      alert('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);

      const answersArray = lesson.questions.map((_, index) => answers[index]);

      const res = await fetch(
        `/api/courses/${courseId}/progress/quiz/${lesson._id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers: answersArray })
        }
      );

      const data = await res.json();
      setResult(data.result);

      if (data.result.passed) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }

    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (existingResult) {
    return (
      <div className="quiz-lesson">
        <div className="lesson-header">
          <h2>❓ {lesson.title}</h2>
        </div>
        <div className="quiz-passed">
          <h3>✅ Quiz Passed!</h3>
          <p>Score: {existingResult.score}%</p>
          <p>You got {existingResult.correctAnswers} out of {existingResult.totalQuestions} correct</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="quiz-lesson">
        <div className="lesson-header">
          <h2>❓ {lesson.title}</h2>
        </div>
        <div className={`quiz-result ${result.passed ? 'passed' : 'failed'}`}>
          <h3>{result.passed ? '✅ Passed!' : '❌ Not Passed'}</h3>
          <p>Score: {result.score}%</p>
          <p>You got {result.correctAnswers} out of {result.totalQuestions} correct</p>
          <p>Passing score: {lesson.passingScore}%</p>
          
          {!result.passed && (
            <button onClick={() => {
              setResult(null);
              setAnswers({});
            }}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-lesson">
      <div className="lesson-header">
        <h2>❓ {lesson.title}</h2>
        <span className="passing-score">Passing: {lesson.passingScore}%</span>
      </div>

      <div className="quiz-content">
        {lesson.questions.map((question, index) => (
          <div key={index} className="quiz-question">
            <h4>Question {index + 1}</h4>
            <p>{question.question}</p>

            {question.questionType === 'multiple-choice' ? (
              <div className="quiz-options">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="quiz-option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={answers[index] === optionIndex.toString()}
                      onChange={() => handleAnswerChange(index, optionIndex.toString())}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                className="short-answer-input"
                placeholder="Your answer..."
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          className="submit-quiz-button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}

export default QuizLesson;