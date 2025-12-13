import React from "react";
import Button from "../Button";

function StudentDetailModal({ student, onClose }) {
  if (!student) return null;

  const correctCount = student.submissions.filter((s) => s.isCorrect).length;
  const totalCount = student.submissions.length;
  const percentage = Math.round((correctCount / totalCount) * 100);

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
            {student.submissions.map((submission, idx) => (
              <div
                key={idx}
                className={`border-2 rounded-lg p-6 ${
                  submission.isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-lg text-2xl font-bold ${
                      submission.isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {submission.isCorrect ? "✓" : "✗"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xl mb-4 leading-relaxed">
                      Question {idx + 1}: {submission.question}
                    </p>

                    {/* All Options */}
                    <div className="space-y-3 mb-4">
                      {submission.options.map((option, optIdx) => {
                        const isCorrectAnswer =
                          submission.answer === optIdx.toString();
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
                  </div>
                </div>
              </div>
            ))}
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
