import React, { useState } from "react";

const inputClasses =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark";
const textareaClasses =
  "w-full min-h-[120px] rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-7 text-dark outline-none transition focus:border-dark";
const primaryButtonClasses =
  "inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:bg-light-secondary disabled:cursor-not-allowed disabled:opacity-60";
const dangerButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-error/20 bg-[#fff2f2] px-4 py-3 text-sm font-semibold text-error transition hover:bg-[#ffe8e6]";

function AssignmentQuestionBuilder({ onAddQuestion }) {
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [question, setQuestion] = useState({
    type: "multiple-choice",
    question: "",
    points: 10,
    options: ["", "", "", ""],
    correctAnswer: null,
    matchPairs: [{ left: "", right: "" }],
    wordLimit: 0,
    rubric: "",
    fileRequirements: ""
  });

  const handleTypeChange = (type) => {
    setQuestionType(type);
    setQuestion((prev) => ({ ...prev, type, correctAnswer: null }));
  };

  const parseChoiceValue = (value) => (value === "" ? null : Number(value));

  const handleAddQuestion = () => {
    if (!question.question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (question.type === "multiple-choice") {
      if (question.options.some((option) => !option.trim())) {
        alert("Please fill in all answer options");
        return;
      }
      if (question.correctAnswer === null) {
        alert("Please select the correct answer");
        return;
      }
    }

    if (question.type === "true-false" && question.correctAnswer === null) {
      alert("Please select the correct answer");
      return;
    }

    if (
      question.type === "matching" &&
      question.matchPairs.some((pair) => !pair.left.trim() || !pair.right.trim())
    ) {
      alert("Please fill in all matching pairs");
      return;
    }

    onAddQuestion(question);

    setQuestion({
      type: questionType,
      question: "",
      points: 10,
      options: ["", "", "", ""],
      correctAnswer: null,
      matchPairs: [{ left: "", right: "" }],
      wordLimit: 0,
      rubric: "",
      fileRequirements: ""
    });
  };

  const addMatchPair = () => {
    setQuestion((prev) => ({
      ...prev,
      matchPairs: [...prev.matchPairs, { left: "", right: "" }]
    }));
  };

  const removeMatchPair = (index) => {
    setQuestion((prev) => ({
      ...prev,
      matchPairs: prev.matchPairs.filter((_, pairIndex) => pairIndex !== index)
    }));
  };

  return (
    <div className="space-y-6 rounded-[28px] border border-border bg-white p-5">
      <div>
        <h4 className="text-2xl font-bold text-dark">Add Assignment Question</h4>
        <p className="mt-2 text-sm leading-7 text-dark-secondary">
          Build the module assignment one question at a time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(event) => handleTypeChange(event.target.value)}
            className={inputClasses}
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="written">Written Response</option>
            <option value="matching">Matching</option>
            <option value="pdf-upload">PDF Upload</option>
            <option value="true-false">True/False</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">
            Points
          </label>
          <input
            type="number"
            value={question.points}
            onChange={(event) =>
              setQuestion((prev) => ({
                ...prev,
                points: Number(event.target.value) || 1
              }))
            }
            min="1"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-dark">
          Question *
        </label>
        <textarea
          value={question.question}
          onChange={(event) =>
            setQuestion((prev) => ({ ...prev, question: event.target.value }))
          }
          placeholder="Enter your question..."
          rows={4}
          className={textareaClasses}
        />
      </div>

      {questionType === "multiple-choice" ? (
        <div className="space-y-6 rounded-[24px] border border-border bg-light-tertiary p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">
              Answer Options
            </label>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(event) => {
                    const nextOptions = [...question.options];
                    nextOptions[index] = event.target.value;
                    setQuestion((prev) => ({ ...prev, options: nextOptions }));
                  }}
                  placeholder={`Option ${index + 1}`}
                  className={inputClasses}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">
              Correct Answer
            </label>
            <select
              value={question.correctAnswer ?? ""}
              onChange={(event) =>
                setQuestion((prev) => ({
                  ...prev,
                  correctAnswer: parseChoiceValue(event.target.value)
                }))
              }
              className={inputClasses}
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
      ) : null}

      {questionType === "true-false" ? (
        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">
            Correct Answer
          </label>
          <select
            value={question.correctAnswer ?? ""}
            onChange={(event) =>
              setQuestion((prev) => ({
                ...prev,
                correctAnswer: parseChoiceValue(event.target.value)
              }))
            }
            className={inputClasses}
          >
            <option value="">Select correct answer...</option>
            <option value={0}>True</option>
            <option value={1}>False</option>
          </select>
        </div>
      ) : null}

      {questionType === "written" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">
              Word Limit (0 = no limit)
            </label>
            <input
              type="number"
              value={question.wordLimit}
              onChange={(event) =>
                setQuestion((prev) => ({
                  ...prev,
                  wordLimit: Number(event.target.value) || 0
                }))
              }
              min="0"
              className={inputClasses}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-dark">
              Grading Rubric (optional)
            </label>
            <textarea
              value={question.rubric}
              onChange={(event) =>
                setQuestion((prev) => ({ ...prev, rubric: event.target.value }))
              }
              placeholder="Describe how this will be graded..."
              rows={4}
              className={textareaClasses}
            />
          </div>
        </div>
      ) : null}

      {questionType === "matching" ? (
        <div className="space-y-4 rounded-[24px] border border-border bg-light-tertiary p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label className="block text-sm font-semibold text-dark">
                Matching Pairs
              </label>
              <p className="mt-1 text-sm text-dark-secondary">
                Add the terms learners need to connect.
              </p>
            </div>

            <button
              type="button"
              onClick={addMatchPair}
              className={secondaryButtonClasses}
            >
              Add Pair
            </button>
          </div>

          <div className="space-y-3">
            {question.matchPairs.map((pair, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-border bg-white p-4"
              >
                <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-center">
                  <input
                    type="text"
                    value={pair.left}
                    onChange={(event) => {
                      const nextPairs = [...question.matchPairs];
                      nextPairs[index].left = event.target.value;
                      setQuestion((prev) => ({ ...prev, matchPairs: nextPairs }));
                    }}
                    placeholder="Left side"
                    className={inputClasses}
                  />

                  <span className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                    To
                  </span>

                  <input
                    type="text"
                    value={pair.right}
                    onChange={(event) => {
                      const nextPairs = [...question.matchPairs];
                      nextPairs[index].right = event.target.value;
                      setQuestion((prev) => ({ ...prev, matchPairs: nextPairs }));
                    }}
                    placeholder="Right side"
                    className={inputClasses}
                  />

                  {question.matchPairs.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeMatchPair(index)}
                      className={dangerButtonClasses}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {questionType === "pdf-upload" ? (
        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">
            File Requirements
          </label>
          <textarea
            value={question.fileRequirements}
            onChange={(event) =>
              setQuestion((prev) => ({
                ...prev,
                fileRequirements: event.target.value
              }))
            }
            placeholder="e.g., PDF format, max 10MB, must include cover page..."
            rows={4}
            className={textareaClasses}
          />
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddQuestion}
          className={primaryButtonClasses}
        >
          Add Question
        </button>
      </div>
    </div>
  );
}

export default AssignmentQuestionBuilder;
