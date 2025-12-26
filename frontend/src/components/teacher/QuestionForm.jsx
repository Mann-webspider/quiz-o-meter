import { useState } from "react";
import Button from "../Button";

import QuestionTypeSelector from "./QuestionTypeSelector";

function QuestionForm({ register, onSubmit, answerValue, watch, setValue }) {
	const [questionType, setQuestionType] = useState("multiple-choice");

	const handleTypeChange = (newType) => {
		setQuestionType(newType);
		setValue("type", newType);
		setValue("answer", newType === "multi-select" ? [] : "");
	};

	const handleMultiSelectToggle = (index) => {
		const currentAnswers = watch("answer") || [];
		const indexStr = String(index);

		if (currentAnswers.includes(indexStr)) {
			setValue(
				"answer",
				currentAnswers.filter((a) => a !== indexStr),
			);
		} else {
			setValue("answer", [...currentAnswers, indexStr]);
		}
	};

	return (
		<div className="bg-white p-8 rounded-lg">
			<h3 className="text-2xl font-bold mb-6">Add New Question</h3>
			<form onSubmit={onSubmit} className="space-y-8">
				{/* Question Type Selector */}
				<QuestionTypeSelector
					selectedType={questionType}
					onTypeChange={handleTypeChange}
				/>

				{/* Question Input */}
				<div name="question">
					<label
						className="block text-sm font-medium mb-3 uppercase tracking-wider text-gray-700"
						htmlFor="question"
					>
						Question
					</label>
					<textarea
						placeholder="Enter your question here..."
						{...register("question", { required: true })}
						className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none resize-none text-lg"
						rows="4"
					/>
				</div>

				{/* Options (Only for MCQ and Multi-select) */}
				{(questionType === "multiple-choice" ||
					questionType === "multi-select") && (
					<>
						<div name="options">
							<label
								className="block text-sm font-medium mb-4 uppercase tracking-wider text-gray-700"
								htmlFor="options"
							>
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
						<div name="correct-answer">
							<label
								className="block text-sm font-medium mb-4 uppercase tracking-wider text-gray-700"
								
							>
								Correct Answer{questionType === "multi-select" ? "s" : ""}
								{questionType === "multi-select" && (
									<span className="text-xs text-gray-500 ml-2">
										(Select all that apply)
									</span>
								)}
							</label>

							{questionType === "multiple-choice" ? (
								// Radio buttons for single choice
								<div className="grid grid-cols-4 gap-4">
  {["A", "B", "C", "D"].map((letter, idx) => (
    <label
      key={idx}
      className={`h-16 flex items-center justify-center border-2 rounded-lg cursor-pointer text-xl font-bold transition-all ${
        answerValue === String(idx)
          ? "border-black bg-black text-white scale-105"
          : "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
      }`}
    >
      <input
        type="radio"
        value={String(idx)}   // 👈 FIX
        {...register("answer", { required: true })}
        className="hidden"
      />
      {letter}
    </label>
  ))}
</div>
							) : (
								// Checkboxes for multi-select
								<div className="grid grid-cols-4 gap-4">
									{["A", "B", "C", "D"].map((letter, idx) => {
										const selected = (watch("answer") || []).includes(
											String(idx),
										);
										return (
											<button
												key={idx}
												type="button"
												onClick={() => handleMultiSelectToggle(idx)}
												className={`h-16 flex items-center justify-center border-2 rounded-lg text-xl font-bold transition-all ${
													selected
														? "border-black bg-black text-white scale-105"
														: "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
												}`}
											>
												{letter}
											</button>
										);
									})}
								</div>
							)}
						</div>
					</>
				)}

				{/* Long Answer - No options needed */}
				{questionType === "long-answer" && (
					<div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
						<p className="text-sm text-blue-800">
							<span className="font-bold">ℹ️ Long Answer Question:</span>
							<br />
							Students will provide a written response. You'll need to manually
							grade these answers.
						</p>
					</div>
				)}

				{/* Points */}
				<div name="points">
					<label
						htmlFor="points"
						className="block text-sm font-medium mb-3 uppercase tracking-wider text-gray-700"
					>
						Points
					</label>
					<input
						type="number"
						min="1"
						defaultValue="1"
						{...register("points", { required: true, min: 1 })}
						className="w-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none text-lg"
					/>
				</div>

				<Button text="Add Question" type="submit" />
			</form>
		</div>
	);
}

export default QuestionForm;
