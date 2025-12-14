import React from "react";
import Button from "../Button";

function StudentDetailModal({ student, onClose }) {
  if (!student) return null;

  const correctCount = student.submissions.filter((s) => s.isCorrect).length;
  const totalCount = student.submissions.length;
  const percentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-2">{student.studentName}</h2>
            <p className="text-gray-600 text-lg">Detailed Answer Review</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center text-4xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            ×
          </button>
        </div>

        <div className="p-8">
          {/* Score Summary */}
          <div className="bg-gray-100 p-8 rounded-lg mb-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wider mb-2">
                  Total Questions
                </p>
                <p className="text-5xl font-bold">{totalCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wider mb-2">
                  Correct Answers
                </p>
                <p className="text-5xl font-bold text-green-600">
                  {correctCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wider mb-2">
                  Score
                </p>
                <p className="text-5xl font-bold">{percentage}%</p>
              </div>
            </div>
          </div>

          {/* Answer Breakdown */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Answer Breakdown</h3>
            {student.submissions.map((submission, idx) => {
              const type = submission.type || "multiple-choice";

              return (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-6 ${
                    submission.isCorrect === true
                      ? "border-green-500 bg-green-50"
                      : submission.isCorrect === false
                      ? "border-red-500 bg-red-50"
                      : "border-yellow-500 bg-yellow-50" // Pending review
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-bold text-gray-800">
                          {idx + 1}.
                        </span>
                        <p className="font-bold text-xl leading-relaxed flex-1">
                          {submission.question}
                        </p>
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                          {type === "multiple-choice"
                            ? "Multiple Choice"
                            : type === "multi-select"
                            ? "Multi-Select"
                            : "Long Answer"}
                        </span>
                      </div>

                      {/* Multiple Choice Questions */}
                      {type === "multiple-choice" && submission.options && (
                        <div className="space-y-3 mb-4">
                          {submission.options.map((option, optIdx) => {
                            const isCorrectAnswer =
                              submission.answer === String(optIdx);
                            const isStudentAnswer =
                              submission.studentAns === option;

                            return (
                              <div
                                key={optIdx}
                                className={`p-4 rounded-lg border-2 text-base ${
                                  isCorrectAnswer
                                    ? "border-green-600 bg-green-100 font-bold"
                                    : isStudentAnswer && !submission.isCorrect
                                    ? "border-red-600 bg-red-100 font-bold"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                <span className="font-bold mr-2">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                {option}
                                {isCorrectAnswer && (
                                  <span className="ml-3 text-green-700 font-bold">
                                    ✓ Correct Answer
                                  </span>
                                )}
                                {isStudentAnswer && (
                                  <span className="ml-3 text-blue-700 font-bold">
                                    ← Student's Choice
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Multi-Select Questions */}
                      {type === "multi-select" && submission.options && (
                        <div className="space-y-3 mb-4">
                          <p className="text-sm text-gray-600 italic mb-2">
                            Multiple correct answers possible
                          </p>
                          {submission.options.map((option, optIdx) => {
                            // Parse correct answers (array of indices)
                            const correctAnswers = Array.isArray(
                              submission.answer
                            )
                              ? submission.answer
                              : JSON.parse(submission.answer || "[]");

                            // Parse student answers
                            const studentAnswers = Array.isArray(
                              submission.studentAns
                            )
                              ? submission.studentAns
                              : JSON.parse(submission.studentAns || "[]");

                            const isCorrectAnswer = correctAnswers.includes(
                              String(optIdx)
                            );
                            const isStudentAnswer = studentAnswers.includes(
                              String(optIdx)
                            );

                            return (
                              <div
                                key={optIdx}
                                className={`p-4 rounded-lg border-2 text-base ${
                                  isCorrectAnswer && isStudentAnswer
                                    ? "border-green-600 bg-green-100 font-bold"
                                    : isCorrectAnswer && !isStudentAnswer
                                    ? "border-yellow-600 bg-yellow-100 font-semibold"
                                    : isStudentAnswer && !isCorrectAnswer
                                    ? "border-red-600 bg-red-100 font-bold"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                <span className="font-bold mr-2">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                {option}
                                {isCorrectAnswer && (
                                  <span className="ml-3 text-green-700 font-bold">
                                    ✓ Correct
                                  </span>
                                )}
                                {isStudentAnswer && isCorrectAnswer && (
                                  <span className="ml-3 text-blue-700 font-bold">
                                    ← Selected (Correct)
                                  </span>
                                )}
                                {isStudentAnswer && !isCorrectAnswer && (
                                  <span className="ml-3 text-red-700 font-bold">
                                    ← Selected (Incorrect)
                                  </span>
                                )}
                                {!isStudentAnswer && isCorrectAnswer && (
                                  <span className="ml-3 text-yellow-700 font-semibold">
                                    (Missed)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Long Answer Questions */}
                      {type === "long-answer" && (
                        <div className="space-y-4">
                          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                            <p className="text-sm text-gray-600 font-semibold mb-2">
                              Student's Answer:
                            </p>
                            <p className="text-base text-gray-800 whitespace-pre-wrap">
                              {submission.studentAns || "(No answer provided)"}
                            </p>
                          </div>

                          {submission.isCorrect === null && (
                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                              <p className="text-yellow-800 font-semibold">
                                ⏳ Pending Manual Review
                              </p>
                              <p className="text-sm text-yellow-700 mt-1">
                                This answer requires teacher evaluation
                              </p>
                            </div>
                          )}

                          {submission.isCorrect === true && (
                            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                              <p className="text-green-800 font-semibold">
                                ✓ Marked as Correct by Teacher
                              </p>
                            </div>
                          )}

                          {submission.isCorrect === false && (
                            <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
                              <p className="text-red-800 font-semibold">
                                ✗ Marked as Incorrect by Teacher
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Points Display */}
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Points:{" "}
                          <span className="font-bold">
                            {submission.earnedPoints || 0}
                          </span>{" "}
                          / {submission.points || 1}
                        </span>
                        {submission.isCorrect === true && (
                          <span className="text-green-600 font-bold text-2xl">
                            ✓
                          </span>
                        )}
                        {submission.isCorrect === false && (
                          <span className="text-red-600 font-bold text-2xl">
                            ✗
                          </span>
                        )}
                        {submission.isCorrect === null && (
                          <span className="text-yellow-600 font-bold">⏳</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Button text="Close" click={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailModal;
