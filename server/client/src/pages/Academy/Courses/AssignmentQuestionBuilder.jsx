import React, { useState } from 'react';

function AssignmentQuestionBuilder({ onAddQuestion }) {
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [question, setQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    points: 10,
    // Multiple choice
    options: ['', '', '', ''],
    correctAnswer: null,
    // Matching
    matchPairs: [{ left: '', right: '' }],
    // Written
    wordLimit: 0,
    rubric: '',
    // PDF
    fileRequirements: ''
  });

  const handleTypeChange = (type) => {
    setQuestionType(type);
    setQuestion({ ...question, type });
  };

  const handleAddQuestion = () => {
    if (!question.question.trim()) {
      alert('Please enter a question');
      return;
    }

    // Validate based on type
    if (question.type === 'multiple-choice') {
      if (question.options.some(opt => !opt.trim())) {
        alert('Please fill in all answer options');
        return;
      }
      if (question.correctAnswer === null) {
        alert('Please select the correct answer');
        return;
      }
    }

    if (question.type === 'matching') {
      if (question.matchPairs.some(pair => !pair.left.trim() || !pair.right.trim())) {
        alert('Please fill in all matching pairs');
        return;
      }
    }

    onAddQuestion(question);
    
    // Reset
    setQuestion({
      type: questionType,
      question: '',
      points: 10,
      options: ['', '', '', ''],
      correctAnswer: null,
      matchPairs: [{ left: '', right: '' }],
      wordLimit: 0,
      rubric: '',
      fileRequirements: ''
    });
  };

  const addMatchPair = () => {
    setQuestion({
      ...question,
      matchPairs: [...question.matchPairs, { left: '', right: '' }]
    });
  };

  const removeMatchPair = (index) => {
    setQuestion({
      ...question,
      matchPairs: question.matchPairs.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="assignment-question-builder">
      <h4>Add Assignment Question</h4>

      {/* Question Type Selector */}
      <div className="form-group">
        <label>Question Type</label>
        <select value={questionType} onChange={(e) => handleTypeChange(e.target.value)}>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="written">Written Response</option>
          <option value="matching">Matching</option>
          <option value="pdf-upload">PDF Upload</option>
          <option value="true-false">True/False</option>
        </select>
      </div>

      {/* Question Text */}
      <div className="form-group">
        <label>Question *</label>
        <textarea
          value={question.question}
          onChange={(e) => setQuestion({ ...question, question: e.target.value })}
          placeholder="Enter your question..."
          rows={3}
        />
      </div>

      {/* Points */}
      <div className="form-group">
        <label>Points</label>
        <input
          type="number"
          value={question.points}
          onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) })}
          min="1"
        />
      </div>

      {/* Type-specific fields */}
      {questionType === 'multiple-choice' && (
        <>
          <div className="form-group">
            <label>Answer Options</label>
            {question.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[index] = e.target.value;
                  setQuestion({ ...question, options: newOptions });
                }}
                placeholder={`Option ${index + 1}`}
                style={{ marginBottom: '8px' }}
              />
            ))}
          </div>

          <div className="form-group">
            <label>Correct Answer</label>
            <select
              value={question.correctAnswer ?? ''}
              onChange={(e) => setQuestion({ ...question, correctAnswer: parseInt(e.target.value) })}
            >
              <option value="">Select correct answer...</option>
              {question.options.map((option, index) => (
                <option key={index} value={index}>
                  {option || `Option ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

    {questionType === 'true-false' && (
    <div className="form-group">
        <label>Correct Answer</label>
        <select
        value={question.correctAnswer ?? ''}
        onChange={(e) => setQuestion({ ...question, correctAnswer: parseInt(e.target.value) })}
        >
        <option value="">Select correct answer...</option>
        <option value={0}>True</option>
        <option value={1}>False</option>
        </select>
    </div>
    )}

      {questionType === 'written' && (
        <>
          <div className="form-group">
            <label>Word Limit (0 = no limit)</label>
            <input
              type="number"
              value={question.wordLimit}
              onChange={(e) => setQuestion({ ...question, wordLimit: parseInt(e.target.value) })}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Grading Rubric (optional)</label>
            <textarea
              value={question.rubric}
              onChange={(e) => setQuestion({ ...question, rubric: e.target.value })}
              placeholder="Describe how this will be graded..."
              rows={3}
            />
          </div>
        </>
      )}

      {questionType === 'matching' && (
        <div className="form-group">
          <label>Matching Pairs</label>
          {question.matchPairs.map((pair, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input
                type="text"
                value={pair.left}
                onChange={(e) => {
                  const newPairs = [...question.matchPairs];
                  newPairs[index].left = e.target.value;
                  setQuestion({ ...question, matchPairs: newPairs });
                }}
                placeholder="Left side"
                style={{ flex: 1 }}
              />
              <span style={{ alignSelf: 'center' }}>↔</span>
              <input
                type="text"
                value={pair.right}
                onChange={(e) => {
                  const newPairs = [...question.matchPairs];
                  newPairs[index].right = e.target.value;
                  setQuestion({ ...question, matchPairs: newPairs });
                }}
                placeholder="Right side"
                style={{ flex: 1 }}
              />
              {question.matchPairs.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeMatchPair(index)}
                  className="remove-button"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addMatchPair} className="secondary-button">
            + Add Pair
          </button>
        </div>
      )}

      {questionType === 'pdf-upload' && (
        <div className="form-group">
          <label>File Requirements</label>
          <textarea
            value={question.fileRequirements}
            onChange={(e) => setQuestion({ ...question, fileRequirements: e.target.value })}
            placeholder="e.g., PDF format, max 10MB, must include cover page..."
            rows={3}
          />
        </div>
      )}

      <button type="button" onClick={handleAddQuestion} className="add-button">
        Add Question
      </button>
    </div>
  );
}

export default AssignmentQuestionBuilder;