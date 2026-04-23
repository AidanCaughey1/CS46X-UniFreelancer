import React, { useState } from 'react';
import AssignmentQuestionBuilder from './AssignmentQuestionBuilder';

function AssignmentBuilder({ assignment, onSave, onRemove }) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [assignmentType, setAssignmentType] = useState('question-based'); // 'question-based' or 'part-based'
  
  // Question-based state
  const [assignmentQuestions, setAssignmentQuestions] = useState([]);
  
  // Part-based state (your original)
  const [assignmentData, setAssignmentData] = useState(
    assignment || {
      title: '',
      purpose: '',
      instructions: '',
      parts: [],
      gradingCriteria: [],
      deliverableFormat: '',
      totalPoints: 30
    }
  );

  const [newPart, setNewPart] = useState({
    partNumber: 1,
    title: '',
    instructions: ''
  });

  const [newCriterion, setNewCriterion] = useState({
    name: '',
    points: 0
  });

  // Question-based handlers
  const handleAddQuestion = (question) => {
    const questionWithNumber = {
      ...question,
      questionNumber: assignmentQuestions.length + 1
    };
    setAssignmentQuestions([...assignmentQuestions, questionWithNumber]);
  };

  const removeQuestion = (index) => {
    const updated = assignmentQuestions.filter((_, i) => i !== index);
    const renumbered = updated.map((q, i) => ({ ...q, questionNumber: i + 1 }));
    setAssignmentQuestions(renumbered);
  };

  // Part-based handlers (your original)
  const addPart = () => {
    if (!newPart.title || !newPart.instructions) {
      alert('Please fill in part title and instructions');
      return;
    }

    setAssignmentData({
      ...assignmentData,
      parts: [...assignmentData.parts, { ...newPart, partNumber: assignmentData.parts.length + 1 }]
    });

    setNewPart({ partNumber: assignmentData.parts.length + 2, title: '', instructions: '' });
  };

  const removePart = (index) => {
    setAssignmentData({
      ...assignmentData,
      parts: assignmentData.parts.filter((_, i) => i !== index)
    });
  };

  const addCriterion = () => {
    if (!newCriterion.name || newCriterion.points <= 0) {
      alert('Please fill in criterion name and points');
      return;
    }

    setAssignmentData({
      ...assignmentData,
      gradingCriteria: [...assignmentData.gradingCriteria, newCriterion]
    });

    setNewCriterion({ name: '', points: 0 });
  };

  const removeCriterion = (index) => {
    setAssignmentData({
      ...assignmentData,
      gradingCriteria: assignmentData.gradingCriteria.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (assignmentType === 'question-based') {
      // Save question-based assignment
      if (assignmentQuestions.length === 0) {
        alert('Please add at least one question');
        return;
      }

      const totalPoints = assignmentQuestions.reduce((sum, q) => sum + q.points, 0);

      const newAssignment = {
        title: 'Module Assignment',
        instructions: 'Complete all questions below',
        questions: assignmentQuestions,
        totalPoints
      };

      onSave(newAssignment);
      setIsBuilding(false);
      setAssignmentQuestions([]);
      
    } else {
      // Save part-based assignment (your original)
      if (!assignmentData.title) {
        alert('Please enter an assignment title');
        return;
      }
      if (!assignmentData.purpose) {
        alert('Please enter the assignment purpose');
        return;
      }
      if (assignmentData.parts.length === 0) {
        alert('Please add at least one part');
        return;
      }
      if (assignmentData.gradingCriteria.length === 0) {
        alert('Please add grading criteria');
        return;
      }

      onSave(assignmentData);
      setIsBuilding(false);
    }
  };

  const handleCancel = () => {
    setAssignmentData({
      title: '',
      purpose: '',
      instructions: '',
      parts: [],
      gradingCriteria: [],
      deliverableFormat: '',
      totalPoints: 30
    });
    setAssignmentQuestions([]);
    setIsBuilding(false);
  };

  // Preview existing assignment
  if (assignment && !isBuilding) {
    const isQuestionBased = assignment.questions && assignment.questions.length > 0;
    
    return (
      <div className="mt-6 rounded-[28px] border border-border bg-light-tertiary p-5 lg:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-dark mb-2">{assignment.title || 'Module Assignment'}</h4>
            {assignment.purpose && <p className="text-sm leading-7 text-dark-secondary mb-3">{assignment.purpose}</p>}
            <div className="flex flex-wrap items-center gap-2 text-sm text-dark-secondary">
              {isQuestionBased ? (
                <>
                  <span className="font-semibold">{assignment.questions.length} questions</span>
                  <span className="text-border">•</span>
                  <span className="font-semibold">{assignment.totalPoints} points</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">{assignment.parts?.length || 0} parts</span>
                  <span className="text-border">•</span>
                  <span className="font-semibold">{assignment.gradingCriteria?.reduce((sum, c) => sum + c.points, 0) || 0} points</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button onClick={() => setIsBuilding(true)} className="inline-flex items-center justify-center rounded-full border border-dark bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:bg-light-secondary">
              Edit
            </button>
            <button onClick={onRemove} className="inline-flex items-center justify-center rounded-full bg-error/10 text-error px-4 py-2 text-sm font-semibold transition hover:bg-error/20">
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isBuilding && !assignment) {
    return (
      <div className="mt-6 rounded-[28px] border border-dashed border-border bg-light-tertiary px-5 py-10 text-center shadow-sm">
        <p className="text-sm text-dark-secondary mb-4">No assignment added yet</p>
        <button onClick={() => setIsBuilding(true)} className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary">
          + Add Assignment
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-[28px] border border-border bg-white p-5 lg:p-6 shadow-sm">
      {/* Assignment Type Selector */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-dark mb-4">Assignment Type</h4>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className={`flex-1 flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all ${assignmentType === 'question-based' ? 'border-accent bg-accent/5' : 'border-border bg-white hover:border-accent/50'}`}>
            <input
              type="radio"
              value="question-based"
              checked={assignmentType === 'question-based'}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="mt-1 h-4 w-4 text-accent border-border focus:ring-accent"
            />
            <div className="flex flex-col">
              <strong className="text-dark font-bold text-base mb-1">Question-Based</strong>
              <span className="text-dark-secondary text-sm">Multiple choice, written response, matching, PDF upload</span>
            </div>
          </label>

          <label className={`flex-1 flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all ${assignmentType === 'part-based' ? 'border-accent bg-accent/5' : 'border-border bg-white hover:border-accent/50'}`}>
            <input
              type="radio"
              value="part-based"
              checked={assignmentType === 'part-based'}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="mt-1 h-4 w-4 text-accent border-border focus:ring-accent"
            />
            <div className="flex flex-col">
              <strong className="text-dark font-bold text-base mb-1">Part-Based (Traditional)</strong>
              <span className="text-dark-secondary text-sm">Open-ended assignment with custom parts and criteria</span>
            </div>
          </label>
        </div>
      </div>

      {/* Question-Based Builder */}
      {assignmentType === 'question-based' && (
        <div className="space-y-6">
          <AssignmentQuestionBuilder onAddQuestion={handleAddQuestion} />

          {assignmentQuestions.length > 0 && (
            <div className="rounded-[28px] border border-border bg-light-tertiary p-5 lg:p-6 shadow-sm mt-6">
              <h4 className="text-lg font-bold text-dark mb-4">Assignment Questions ({assignmentQuestions.length})</h4>
              <div className="space-y-4 mb-6">
                {assignmentQuestions.map((q, index) => (
                  <div key={index} className="rounded-2xl border border-border bg-white p-5 border-l-4 border-l-accent shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-dark">Q{index + 1}</span>
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">{q.type}</span>
                        <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">{q.points} pts</span>
                      </div>
                      <button onClick={() => removeQuestion(index)} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0" title="Remove Question">
                        ✕
                      </button>
                    </div>
                    <p className="text-dark-secondary text-sm leading-6">{q.question}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mt-2 text-right text-dark text-lg">
                <strong className="font-bold">Total Points: </strong>
                {assignmentQuestions.reduce((sum, q) => sum + q.points, 0)} pts
              </div>
            </div>
          )}
        </div>
      )}

      {/* Part-Based Builder (Your Original) */}
      {assignmentType === 'part-based' && (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Assignment Title *</label>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
              type="text"
              value={assignmentData.title}
              onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
              placeholder="e.g., Building Your Brand Identity & Social Currency Strategy"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Purpose *</label>
            <textarea
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark"
              value={assignmentData.purpose}
              onChange={(e) => setAssignmentData({ ...assignmentData, purpose: e.target.value })}
              placeholder="This assignment will help you apply the principles of brand identity..."
              rows={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">General Instructions (optional)</label>
            <textarea
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark"
              value={assignmentData.instructions}
              onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
              placeholder="Overall instructions for completing this assignment..."
              rows={2}
            />
          </div>

          <div className="rounded-[28px] border border-border bg-light-tertiary p-5 lg:p-6 shadow-sm">
            <h4 className="text-lg font-bold text-dark mb-4">Assignment Parts</h4>
            
            <div className="rounded-[24px] border border-border bg-white p-5 mb-5">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-dark">Part Title *</label>
                <input
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                  type="text"
                  value={newPart.title}
                  onChange={(e) => setNewPart({ ...newPart, title: e.target.value })}
                  placeholder="e.g., Define Your Brand Identity"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-dark">Part Instructions *</label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark"
                  value={newPart.instructions}
                  onChange={(e) => setNewPart({ ...newPart, instructions: e.target.value })}
                  placeholder="Create a detailed description of your brand that includes..."
                  rows={3}
                />
              </div>

              <button 
                type="button" 
                onClick={addPart} 
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary"
              >
                + Add Part
              </button>
            </div>

            {assignmentData.parts.length > 0 && (
              <div className="space-y-4">
                {assignmentData.parts.map((part, index) => (
                  <div key={index} className="rounded-2xl border border-border bg-white p-5">
                    <div className="flex justify-between items-center mb-3">
                      <strong className="text-dark font-bold">Part {part.partNumber}: {part.title}</strong>
                      <button 
                        onClick={() => removePart(index)} 
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-dark-secondary text-sm leading-6">{part.instructions}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-border bg-light-tertiary p-5 lg:p-6 shadow-sm">
            <h4 className="text-lg font-bold text-dark mb-4">Grading Criteria</h4>
            
            <div className="rounded-[24px] border border-border bg-white p-5 mb-5">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-[2]">
                  <label className="mb-2 block text-sm font-semibold text-dark">Criterion Name *</label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                    type="text"
                    value={newCriterion.name}
                    onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
                    placeholder="e.g., Brand Identity Summary"
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-2 block text-sm font-semibold text-dark">Points *</label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
                    type="number"
                    value={newCriterion.points}
                    onChange={(e) => setNewCriterion({ ...newCriterion, points: parseInt(e.target.value) || 0 })}
                    placeholder="8"
                    min="0"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={addCriterion} 
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary"
              >
                + Add Criterion
              </button>
            </div>

            {assignmentData.gradingCriteria.length > 0 && (
              <div className="space-y-3">
                {assignmentData.gradingCriteria.map((criterion, index) => (
                  <div key={index} className="flex justify-between items-center rounded-2xl border border-border bg-white px-5 py-3 shadow-sm">
                    <span className="text-dark font-medium flex-1">{criterion.name}</span>
                    <span className="text-accent font-bold mx-3">({criterion.points} pts)</span>
                    <button 
                      onClick={() => removeCriterion(index)} 
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="mt-4 rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] p-4 text-right text-[#0369a1]">
                  <strong>Total Points: </strong>
                  <span className="text-lg font-bold">{assignmentData.gradingCriteria.reduce((sum, c) => sum + c.points, 0)} pts</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Deliverable Format</label>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
              type="text"
              value={assignmentData.deliverableFormat}
              onChange={(e) => setAssignmentData({ ...assignmentData, deliverableFormat: e.target.value })}
              placeholder="e.g., Submit as a written document (Word or PDF)"
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-border pt-6">
        <button 
          type="button" 
          onClick={handleCancel} 
          className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary w-full sm:w-auto"
        >
          Cancel
        </button>
        <button 
          type="button" 
          onClick={handleSave} 
          className="inline-flex items-center justify-center rounded-full bg-success px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#059669] w-full sm:w-auto"
        >
          Save Assignment
        </button>
      </div>
    </div>
  );
}

export default AssignmentBuilder;