import React from "react";

function QuestionList({ questions, onDelete, isPublished }) {
  return (
    <div className="bg-white p-8 rounded-lg">
      <h3 className="text-2xl font-bold mb-6">
        Questions ({questions.length})
      </h3>

      {questions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-7xl mb-4">📝</p>
          <p className="text-xl font-medium">No questions added yet</p>
          <p className="text-sm mt-2">Add your first question to get started</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="font-bold text-lg flex-1 leading-relaxed">
                  {idx + 1}. {q.question}
                </p>
                {!isPublished && (
                  <button
                    onClick={() => onDelete(idx)}
                    className="ml-4 px-4 py-2 text-sm bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded font-medium transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {q.options?.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`px-4 py-3 rounded-lg text-sm ${
                      q.answer === optIdx.toString()
                        ? "bg-gray-800 text-white font-bold"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="font-bold mr-2">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuestionList;
