import React from "react";
import Input from "../Input";
import Button from "../Button";

function QuestionForm({ register, onSubmit, answerValue }) {
  return (
    <div className="bg-white p-8 rounded-lg">
      <h3 className="text-2xl font-bold mb-6">Add New Question</h3>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Question Input - More Space */}
        <div>
          <label className="block text-sm font-medium mb-3 uppercase tracking-wider text-gray-700">
            Question
          </label>
          <textarea
            placeholder="Enter your question here..."
            {...register("question", { required: true })}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none resize-none text-lg"
            rows="4"
          />
        </div>

        {/* Answer Options - More Space */}
        <div>
          <label className="block text-sm font-medium mb-4 uppercase tracking-wider text-gray-700">
            Answer Options
          </label>
          <div className="space-y-4">
            {["A", "B", "C", "D"].map((letter, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg font-bold text-xl">
                  {letter}
                </div>
                <input
                  type="text"
                  placeholder={`Enter option ${letter}`}
                  {...register(`options.${idx}`, { required: true })}
                  className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none text-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Correct Answer Selection */}
        <div>
          <label className="block text-sm font-medium mb-4 uppercase tracking-wider text-gray-700">
            Correct Answer
          </label>
          <div className="grid grid-cols-4 gap-4">
            {["A", "B", "C", "D"].map((letter, idx) => (
              <label
                key={idx}
                className={`h-16 flex items-center justify-center border-2 rounded-lg cursor-pointer text-xl font-bold transition-all ${
                  answerValue === idx.toString()
                    ? "border-black bg-black text-white scale-105"
                    : "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  value={idx}
                  {...register("answer", { required: true })}
                  className="hidden"
                />
                {letter}
              </label>
            ))}
          </div>
        </div>

        <Button text="Add Question" type="submit" />
      </form>
    </div>
  );
}

export default QuestionForm;
