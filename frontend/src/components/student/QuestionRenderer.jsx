function QuestionRenderer({ quiz, answer, onAnswerChange }) {
	console.log("Rendering question:", quiz); // Debug log

	const type = quiz.type || quiz.questionType || "multiple-choice"; // Fallback handling

	// Multiple Choice - Single Answer
	if (type === "multiple-choice") {
		return (
			<div className="space-y-3">
				{quiz?.options?.map((option, index) => (
					<label
						key={index}
						className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
							answer === String(index)
								? "border-blue-500 bg-blue-50"
								: "border-gray-200 hover:border-blue-300"
						}`}
					>
						<input
							type="radio"
							name={`question-${quiz.quizId}`}
							value={index}
							checked={answer === String(index)}
							onChange={(e) => onAnswerChange(quiz.quizId, e.target.value)}
							className="mr-3 w-5 h-5"
						/>
						<span className="text-lg">{option}</span>
					</label>
				))}
			</div>
		);
	}

	// Multi-Select - Multiple Answers
	if (type === "multi-select") {
		const selectedAnswers = Array.isArray(answer) ? answer : [];

		const handleCheckboxChange = (index) => {
			const indexStr = String(index);
			let newAnswers;

			if (selectedAnswers.includes(indexStr)) {
				newAnswers = selectedAnswers.filter((a) => a !== indexStr);
			} else {
				newAnswers = [...selectedAnswers, indexStr];
			}

			onAnswerChange(quiz.quizId, newAnswers);
		};

		return (
			<div className="space-y-3">
				<p className="text-sm text-gray-600 italic mb-3">
					Select all that apply
				</p>

				{quiz?.options?.map((option, index) => (
					<label
						key={index}
						className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
							selectedAnswers.includes(String(index))
								? "border-green-500 bg-green-50"
								: "border-gray-200 hover:border-green-300"
						}`}
					>
						<input
							type="checkbox"
							checked={selectedAnswers.includes(String(index))}
							onChange={() => handleCheckboxChange(index)}
							className="mr-3 w-5 h-5"
						/>
						<span className="text-lg">{option}</span>
					</label>
				))}
			</div>
		);
	}

	// Long Answer - Text Input
	if (type === "long-answer") {
		return (
			<div>
				<textarea
					value={answer || ""}
					onChange={(e) => onAnswerChange(quiz.quizId, e.target.value)}
					className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[150px] text-lg"
					placeholder="Type your answer here..."
				/>
				<p className="text-sm text-gray-500 mt-2">
					This will be manually graded by the teacher
				</p>
			</div>
		);
	}

	// Unknown Type - Error State
	return (
		<div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
			<p className="text-red-600 font-semibold">
				Unknown question type: "{type}"
			</p>
			<p className="text-sm text-gray-600 mt-2">
				Question data: {JSON.stringify(quiz, null, 2)}
			</p>
		</div>
	);
}

export default QuestionRenderer;
