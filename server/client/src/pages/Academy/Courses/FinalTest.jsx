import React, { useState } from 'react';
import './CourseLearning.css';
import AlertModal from '../../../components/UI/AlertModal';

function FinalTest({ courseId, finalTest, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < finalTest.questions.length) {
      showAlert('Validation Error', 'Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);

      const answersArray = finalTest.questions.map((_, index) => answers[index]);

      const res = await fetch(
        `/api/courses/${courseId}/progress/test/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers: answersArray })
        }
      );

      const data = await res.json();

      if (data.passed) {
        onComplete(true, data.badge);
      } else {
        showAlert('Test Failed', `Score: ${data.score}%. You need ${finalTest.passingScore}% to pass. Try again!`, 'warning');
        setAnswers({});
      }

    } catch (err) {
      console.error('Error submitting test:', err);
      showAlert('Error', 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="final-test">
      <div className="test-header">
        <h2>📋 {finalTest.title || 'Final Test'}</h2>
        <p>{finalTest.description}</p>
        <div className="test-info">
          <span>Passing Score: {finalTest.passingScore}%</span>
          {finalTest.timeLimit > 0 && (
            <span>Time Limit: {finalTest.timeLimit} minutes</span>
          )}
        </div>
      </div>

      <div className="test-content">
        {finalTest.questions.map((question, index) => (
          <div key={index} className="test-question">
            <h4>Question {index + 1}</h4>
            <p>{question.question}</p>

            <div className="test-options">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="test-option">
                  <input
                    type="radio"
                    name={`test-question-${index}`}
                    value={optionIndex}
                    checked={answers[index] === optionIndex}
                    onChange={() => handleAnswerChange(index, optionIndex)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          className="submit-test-button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Final Test'}
        </button>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}

export default FinalTest;