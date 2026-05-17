import React, { useState } from 'react';
import './ModuleBuilder.css';
import './CreateCourse.css';
import LearningMaterialsInput from './LearningMaterialsInput';
import AssignmentQuestionBuilder from './AssignmentQuestionBuilder';

function ModuleBuilder({ 
  currentModule, 
  setCurrentModule, 
  onSave,
  newOutcome,
  setNewOutcome,
  addLearningOutcome,
  removeLearningOutcome
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
      alert('Please enter a module title');
      return;
    }
    if (!currentModule.overview) {
      alert('Please enter a module overview');
      return;
    }
    if (currentModule.learningOutcomes.length === 0) {
      alert('Please add at least one learning outcome');
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
      alert('Please add at least one question');
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
    <div className="module-builder">

      {/* ===============================
          MODULE INFO
      =============================== */}
      <div className="builder-section">
        <h3>Module Information</h3>

        <div className="form-group">
          <label>Module Title *</label>
          <input
            type="text"
            value={currentModule.title}
            onChange={(e) =>
              setCurrentModule({ ...currentModule, title: e.target.value })
            }
            placeholder="e.g., Module 1: Brand Identity"
          />
        </div>

        <div className="form-group">
          <label>Module Overview *</label>
          <textarea
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
      <div className="builder-section">
        <h3>Learning Outcomes</h3>

        <div className="form-group">
          <div className="add-item-container">
            <input
              type="text"
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLearningOutcome()}
            />
            <button
              type="button"
              onClick={addLearningOutcome}
              className="add-button"
            >
              Add Outcome
            </button>
          </div>
        </div>

        {currentModule.learningOutcomes.length > 0 ? (
          <div className="outcomes-list">
            {currentModule.learningOutcomes.map((outcome, index) => (
              <div key={index} className="outcome-item">
                <span>{index + 1}. {outcome}</span>
                <button
                  onClick={() => removeLearningOutcome(index)}
                  className="remove-button-small"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No learning outcomes added yet
          </p>
        )}
      </div>

      {/* ===============================
          LEARNING MATERIALS
      =============================== */}
      <div className="builder-section">
        <h3>Learning Materials</h3>
        <LearningMaterialsInput
          materials={currentModule.learningMaterials}
          setMaterials={(materials) =>
            setCurrentModule({
              ...currentModule,
              learningMaterials: materials
            })
          }
        />
      </div>

      {/* ===============================
          ASSIGNMENT SECTION
      =============================== */}
      <div className="assignment-section">
        <h4>Assignment (Optional)</h4>

        {!currentModule.assignment && !showAssignment && (
          <button
            type="button"
            onClick={() => setShowAssignment(true)}
            className="secondary-button"
          >
            + Create Assignment
          </button>
        )}

        {showAssignment && (
          <div className="assignment-builder">

            <AssignmentQuestionBuilder
              onAddQuestion={handleAddQuestion}
            />

            {assignmentQuestions.length > 0 && (
              <div className="assignment-questions-list">
                <h5>
                  Assignment Questions ({assignmentQuestions.length})
                </h5>

                {assignmentQuestions.map((q, index) => (
                  <div key={index} className="assignment-question-item">
                    <div className="question-header">
                      <strong>Q{index + 1}: {q.type}</strong>
                      <span>{q.points} pts</span>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="remove-button-small"
                      >
                        Remove
                      </button>
                    </div>
                    <p>{q.question}</p>
                  </div>
                ))}

                <div className="assignment-actions">
                  <button
                    type="button"
                    onClick={handleCreateAssignment}
                    className="primary-button"
                  >
                    Save Assignment to Module
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignment(false);
                      setAssignmentQuestions([]);
                    }}
                    className="secondary-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentModule.assignment && !showAssignment && (
          <div className="assignment-preview">
            <strong>✅ Assignment Added</strong>
            <p>
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
              className="remove-button"
            >
              Remove Assignment
            </button>
          </div>
        )}
      </div>

      {/* ===============================
          SAVE MODULE
      =============================== */}
      <div className="module-actions">
        <button
          type="button"
          onClick={handleSaveModule}
          className="save-module-button"
        >
          + Add Module to Course
        </button>
      </div>

    </div>
  );
}

export default ModuleBuilder;