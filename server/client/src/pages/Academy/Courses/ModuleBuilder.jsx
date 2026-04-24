import React, { useState } from 'react';
import LearningMaterialsInput from './LearningMaterialsInput';
import AssignmentQuestionBuilder from './AssignmentQuestionBuilder';

function ModuleBuilder({ 
  currentModule, 
  setCurrentModule, 
  onSave,
  newOutcome,
  setNewOutcome,
  addLearningOutcome,
  removeLearningOutcome,
  onGenerateOutcomes,
  aiOutcomesLoading,
  showAlert
}) {

  /* ===============================
     ASSIGNMENT STATE
  =============================== */
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentQuestions, setAssignmentQuestions] = useState([]);

  /* ===============================
     MODULE SAVE
  =============================== */
  const handleSaveModule = () => {
    if (!currentModule.title) {
      showAlert('Validation Error', 'Please enter a module title');
      return;
    }
    if (!currentModule.overview) {
      showAlert('Validation Error', 'Please enter a module overview');
      return;
    }
    if (currentModule.learningOutcomes.length === 0) {
      showAlert('Validation Error', 'Please add at least one learning outcome');
      return;
    }

    onSave(currentModule);

    // reset assignment builder UI
    setShowAssignment(false);
    setAssignmentQuestions([]);
  };

  /* ===============================
     ASSIGNMENT LOGIC
  =============================== */

  const handleAddQuestion = (question) => {
    const questionWithNumber = {
      ...question,
      questionNumber: assignmentQuestions.length + 1
    };
    setAssignmentQuestions(prev => [...prev, questionWithNumber]);
  };

  const removeQuestion = (index) => {
    setAssignmentQuestions(prev =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleCreateAssignment = () => {
    if (assignmentQuestions.length === 0) {
      showAlert('Validation Error', 'Please add at least one question');
      return;
    }

    const totalPoints = assignmentQuestions.reduce(
      (sum, q) => sum + Number(q.points || 0),
      0
    );

    const assignment = {
      title: `${currentModule.title || 'Module'} Assignment`,
      instructions: 'Complete all questions below.',
      questions: assignmentQuestions,
      totalPoints
    };

    setCurrentModule(prev => ({
      ...prev,
      assignment
    }));

    setShowAssignment(false);
    setAssignmentQuestions([]);
  };

  return (
    <div className="mt-8 rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">

      {/* ===============================
          MODULE INFO
      =============================== */}
      <div className="mb-10 border-b border-border pb-8 last:border-b-0 last:pb-0">
        <h3 className="mb-4 text-xl font-bold text-dark">Module Information</h3>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-dark">Module Title *</label>
          <input
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
            type="text"
            value={currentModule.title}
            onChange={(e) =>
              setCurrentModule({ ...currentModule, title: e.target.value })
            }
            placeholder="e.g., Module 1: Brand Identity"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">Module Overview *</label>
          <textarea
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark"
            value={currentModule.overview}
            onChange={(e) =>
              setCurrentModule({ ...currentModule, overview: e.target.value })
            }
            rows={4}
          />
        </div>
      </div>

      {/* ===============================
          LEARNING OUTCOMES
      =============================== */}
      <div className="mb-10 border-b border-border pb-8 last:border-b-0 last:pb-0">
        <h3 className="mb-4 text-xl font-bold text-dark">Learning Outcomes</h3>

        <button
          type="button"
          className="mb-4 inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-light-secondary disabled:opacity-50"
          onClick={onGenerateOutcomes}
          disabled={aiOutcomesLoading}
        >
          {aiOutcomesLoading ? "Generating..." : "✨ Generate Outcomes"}
        </button>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="w-full flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark"
              type="text"
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLearningOutcome()}
              placeholder="e.g., Understand brand identity principles"
            />
            <button
              type="button"
              onClick={addLearningOutcome}
              className="inline-flex items-center justify-center rounded-full bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-dark-secondary whitespace-nowrap"
            >
              Add Outcome
            </button>
          </div>
        </div>

        {currentModule.learningOutcomes.length > 0 ? (
          <div className="space-y-3 rounded-2xl border border-border bg-light-tertiary p-5 shadow-sm">
            {currentModule.learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-start justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
                <span className="flex-1 text-sm leading-6 text-dark"><span className="font-bold text-accent mr-2">{index + 1}.</span> {outcome}</span>
                <button
                  onClick={() => removeLearningOutcome(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                  title="Remove Outcome"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-light-tertiary px-5 py-8 text-center text-sm text-dark-secondary">
            No learning outcomes added yet
          </p>
        )}
      </div>

      {/* ===============================
          LEARNING MATERIALS
      =============================== */}
      <div className="mb-10 border-b border-border pb-8 last:border-b-0 last:pb-0">
        <h3 className="mb-4 text-xl font-bold text-dark">Learning Materials</h3>
        <LearningMaterialsInput
          materials={currentModule.learningMaterials}
          setMaterials={(materials) =>
            setCurrentModule({
              ...currentModule,
              learningMaterials: materials
            })
          }
          showAlert={showAlert}
        />
      </div>

      {/* ===============================
          ASSIGNMENT SECTION
      =============================== */}
      <div className="mb-10 border-b border-border pb-8 last:border-b-0 last:pb-0">
        <h4 className="mb-4 text-lg font-bold text-dark">Assignment (Optional)</h4>

        {!currentModule.assignment && !showAssignment && (
          <button
            type="button"
            onClick={() => setShowAssignment(true)}
            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-light-secondary"
          >
            + Create Assignment
          </button>
        )}

        {showAssignment && (
          <div className="mt-4">

            <AssignmentQuestionBuilder
              onAddQuestion={handleAddQuestion}
              showAlert={showAlert}
            />

            {assignmentQuestions.length > 0 && (
              <div className="mt-6 rounded-[28px] border border-border bg-light-tertiary p-5 lg:p-6 shadow-sm">
                <h5 className="mb-4 text-lg font-bold text-dark">
                  Assignment Questions ({assignmentQuestions.length})
                </h5>

                <div className="space-y-4 mb-6">
                  {assignmentQuestions.map((q, index) => (
                    <div key={index} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <strong className="text-dark font-bold">Q{index + 1}: {q.type}</strong>
                          <span className="rounded-full bg-success px-2 py-1 text-xs font-semibold text-white">{q.points} pts</span>
                        </div>
                        <button
                          onClick={() => removeQuestion(index)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm text-dark-secondary">{q.question}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={handleCreateAssignment}
                    className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-tertiary flex-1"
                  >
                    Save Assignment to Module
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignment(false);
                      setAssignmentQuestions([]);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-light-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentModule.assignment && !showAssignment && (
          <div className="mt-4 rounded-[28px] border border-success/30 bg-success/5 p-5 shadow-sm">
            <strong className="block mb-2 text-success font-bold flex items-center gap-2">✅ Assignment Added</strong>
            <p className="text-sm text-dark-secondary mb-4">
              {currentModule.assignment.questions.length} questions •{" "}
              {currentModule.assignment.totalPoints} total points
            </p>
            <button
              onClick={() =>
                setCurrentModule({
                  ...currentModule,
                  assignment: null
                })
              }
              className="inline-flex items-center justify-center rounded-full bg-error/10 text-error px-4 py-2 text-sm font-semibold transition hover:bg-error/20"
            >
              Remove Assignment
            </button>
          </div>
        )}
      </div>

      {/* ===============================
          SAVE MODULE
      =============================== */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSaveModule}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-success px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#059669]"
        >
          + Add Module to Course
        </button>
      </div>

    </div>
  );
}

export default ModuleBuilder;