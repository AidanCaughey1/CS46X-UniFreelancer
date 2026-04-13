import React, { useState } from "react";
import LearningMaterialsInput from "./LearningMaterialsInput";
import AssignmentQuestionBuilder from "./AssignmentQuestionBuilder";

const inputClasses =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark";
const textareaClasses =
  "w-full min-h-[140px] rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark";
const primaryButtonClasses =
  "inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary disabled:cursor-not-allowed disabled:opacity-60";
const dangerButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-error/20 bg-[#fff2f2] px-4 py-3 text-sm font-semibold text-error transition hover:bg-[#ffe8e6]";

function ModuleBuilder({
  currentModule,
  setCurrentModule,
  onSave,
  newOutcome,
  setNewOutcome,
  addLearningOutcome,
  removeLearningOutcome
}) {
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentQuestions, setAssignmentQuestions] = useState([]);

  const handleSaveModule = () => {
    if (!currentModule.title) {
      alert("Please enter a module title");
      return;
    }
    if (!currentModule.overview) {
      alert("Please enter a module overview");
      return;
    }
    if (currentModule.learningOutcomes.length === 0) {
      alert("Please add at least one learning outcome");
      return;
    }

    onSave(currentModule);
    setShowAssignment(false);
    setAssignmentQuestions([]);
  };

  const handleAddQuestion = (question) => {
    const questionWithNumber = {
      ...question,
      questionNumber: assignmentQuestions.length + 1
    };

    setAssignmentQuestions((prev) => [...prev, questionWithNumber]);
  };

  const removeQuestion = (index) => {
    setAssignmentQuestions((prev) =>
      prev.filter((_, questionIndex) => questionIndex !== index)
    );
  };

  const handleCreateAssignment = () => {
    if (assignmentQuestions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const totalPoints = assignmentQuestions.reduce(
      (sum, question) => sum + Number(question.points || 0),
      0
    );

    const assignment = {
      title: `${currentModule.title || "Module"} Assignment`,
      instructions: "Complete all questions below.",
      questions: assignmentQuestions,
      totalPoints
    };

    setCurrentModule((prev) => ({
      ...prev,
      assignment
    }));

    setShowAssignment(false);
    setAssignmentQuestions([]);
  };

  const sectionClasses =
    "space-y-6 rounded-[28px] border border-border bg-light-tertiary p-5";

  return (
    <div className="space-y-6">
      <div className={sectionClasses}>
        <div>
          <h3 className="text-2xl font-bold text-dark">Module Information</h3>
          <p className="mt-2 text-sm leading-7 text-dark-secondary">
            Set the title and overview for this module before adding lessons and
            assignments.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">
            Module Title *
          </label>
          <input
            type="text"
            value={currentModule.title}
            onChange={(event) =>
              setCurrentModule({ ...currentModule, title: event.target.value })
            }
            placeholder="e.g., Module 1: Brand Identity"
            className={inputClasses}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">
            Module Overview *
          </label>
          <textarea
            value={currentModule.overview}
            onChange={(event) =>
              setCurrentModule({ ...currentModule, overview: event.target.value })
            }
            rows={5}
            className={textareaClasses}
          />
        </div>
      </div>

      <div className={sectionClasses}>
        <div>
          <h3 className="text-2xl font-bold text-dark">Learning Outcomes</h3>
          <p className="mt-2 text-sm leading-7 text-dark-secondary">
            Add the outcomes learners should achieve by the end of this module.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newOutcome}
            onChange={(event) => setNewOutcome(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLearningOutcome();
              }
            }}
            placeholder="e.g., Define a clear freelance positioning statement"
            className={`${inputClasses} flex-1`}
          />
          <button
            type="button"
            onClick={addLearningOutcome}
            className={primaryButtonClasses}
          >
            Add Outcome
          </button>
        </div>

        {currentModule.learningOutcomes.length > 0 ? (
          <div className="space-y-3">
            {currentModule.learningOutcomes.map((outcome, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-[24px] border border-border bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-3">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-dark">{outcome}</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeLearningOutcome(index)}
                  className={dangerButtonClasses}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-dark-secondary">
            No learning outcomes added yet.
          </div>
        )}
      </div>

      <div className={sectionClasses}>
        <div>
          <h3 className="text-2xl font-bold text-dark">Learning Materials</h3>
          <p className="mt-2 text-sm leading-7 text-dark-secondary">
            Add reading, podcast, and video resources for the module.
          </p>
        </div>

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

      <div className={sectionClasses}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-2xl font-bold text-dark">Assignment (Optional)</h4>
            <p className="mt-2 text-sm leading-7 text-dark-secondary">
              Create a short assignment learners should complete after this module.
            </p>
          </div>

          {!currentModule.assignment && !showAssignment ? (
            <button
              type="button"
              onClick={() => setShowAssignment(true)}
              className={secondaryButtonClasses}
            >
              Create Assignment
            </button>
          ) : null}
        </div>

        {showAssignment ? (
          <div className="space-y-6">
            <AssignmentQuestionBuilder onAddQuestion={handleAddQuestion} />

            {assignmentQuestions.length > 0 ? (
              <div className="space-y-4 rounded-[28px] border border-border bg-white p-5">
                <h5 className="text-xl font-bold text-dark">
                  Assignment Questions ({assignmentQuestions.length})
                </h5>

                <div className="space-y-3">
                  {assignmentQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-border bg-light-tertiary p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-dark">
                            Q{index + 1}: {question.type}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-dark-secondary">
                            {question.question}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-accent-muted px-3 py-2 text-sm font-semibold text-accent">
                            {question.points} pts
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className={dangerButtonClasses}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCreateAssignment}
                    className={primaryButtonClasses}
                  >
                    Save Assignment to Module
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignment(false);
                      setAssignmentQuestions([]);
                    }}
                    className={secondaryButtonClasses}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {currentModule.assignment && !showAssignment ? (
          <div className="rounded-[24px] border border-accent/20 bg-accent-muted p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-dark">Assignment added</p>
                <p className="mt-2 text-sm leading-7 text-dark-secondary">
                  {currentModule.assignment.questions.length} questions,{" "}
                  {currentModule.assignment.totalPoints} total points
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentModule({
                    ...currentModule,
                    assignment: null
                  })
                }
                className={dangerButtonClasses}
              >
                Remove Assignment
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveModule}
          className={primaryButtonClasses}
        >
          Add Module to Course
        </button>
      </div>
    </div>
  );
}

export default ModuleBuilder;
