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
    <div className="mt-6 rounded-[28px] border border-border bg-white p-5 lg:p-6 shadow-sm">
      <h4 className="mb-4 text-lg font-bold text-dark">Add Assignment Question</h4>

      {/* Question Type Selector */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-dark">Question Type</label>
        <select 
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
          value={questionType} 
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="written">Written Response</option>
          <option value="matching">Matching</option>
          <option value="pdf-upload">PDF Upload</option>
          <option value="true-false">True/False</option>
        </select>
      </div>

      {/* Question Text */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-dark">Question *</label>
        <textarea
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark"
          value={question.question}
          onChange={(e) => setQuestion({ ...question, question: e.target.value })}
          placeholder="Enter your question..."
          rows={3}
        />
      </div>

      {/* Points */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-dark">Points</label>
        <input
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
          type="number"
          value={question.points}
          onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) })}
          min="1"
        />
      </div>

      {/* Type-specific fields */}
      {questionType === 'multiple-choice' && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Answer Options</label>
            <div className="flex flex-col gap-3">
              {question.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[index] = e.target.value;
                    setQuestion({ ...question, options: newOptions });
                  }}
                  placeholder={`Option ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Correct Answer</label>
            <select
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
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
        </div>
      )}

    {questionType === 'true-false' && (
    <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-dark">Correct Answer</label>
        <select
        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
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
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Word Limit (0 = no limit)</label>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
              type="number"
              value={question.wordLimit}
              onChange={(e) => setQuestion({ ...question, wordLimit: parseInt(e.target.value) })}
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Grading Rubric (optional)</label>
            <textarea
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark"
              value={question.rubric}
              onChange={(e) => setQuestion({ ...question, rubric: e.target.value })}
              placeholder="Describe how this will be graded..."
              rows={3}
            />
          </div>
        </div>
      )}

      {questionType === 'matching' && (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-dark">Matching Pairs</label>
          <div className="flex flex-col gap-3">
            {question.matchPairs.map((pair, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  className="w-full flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                  value={pair.left}
                  onChange={(e) => {
                    const newPairs = [...question.matchPairs];
                    newPairs[index].left = e.target.value;
                    setQuestion({ ...question, matchPairs: newPairs });
                  }}
                  placeholder="Left side"
                />
                <span className="text-dark font-bold px-2 hidden sm:block">↔</span>
                <input
                  type="text"
                  className="w-full flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                  value={pair.right}
                  onChange={(e) => {
                    const newPairs = [...question.matchPairs];
                    newPairs[index].right = e.target.value;
                    setQuestion({ ...question, matchPairs: newPairs });
                  }}
                  placeholder="Right side"
                />
                {question.matchPairs.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeMatchPair(index)}
                    className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                    title="Remove Pair"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addMatchPair} 
              className="inline-flex w-fit items-center justify-center rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary mt-2"
            >
              + Add Pair
            </button>
          </div>
        </div>
      )}

      {questionType === 'pdf-upload' && (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-dark">File Requirements</label>
          <textarea
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark"
            value={question.fileRequirements}
            onChange={(e) => setQuestion({ ...question, fileRequirements: e.target.value })}
            placeholder="e.g., PDF format, max 10MB, must include cover page..."
            rows={3}
          />
        </div>
      )}

      <button 
        type="button" 
        onClick={handleAddQuestion} 
        className="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary"
      >
        Add Question
      </button>
    </div>
  );
}

export default AssignmentQuestionBuilder;