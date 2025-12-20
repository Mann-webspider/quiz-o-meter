function QuestionList({ questions, onDelete, isPublished }) {
	const getTypeIcon = (type) => {
		switch (type) {
			case "multiple-choice":
				return "⭕";
			case "multi-select":
				return "☑️";
			case "long-answer":
				return "📝";
			default:
				return "❓";
		}
	};

	const getTypeLabel = (type) => {
		switch (type) {
			case "multiple-choice":
				return "Multiple Choice";
			case "multi-select":
				return "Multi Select";
			case "long-answer":
				return "Long Answer";
			default:
				return "Unknown";
		}
	};

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
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<span className="text-2xl">{getTypeIcon(q.type)}</span>
										<span className="text-xs bg-gray-200 px-3 py-1 rounded-full font-medium">
											{getTypeLabel(q.type)}
										</span>
										<span className="text-xs bg-blue-200 px-3 py-1 rounded-full font-medium">
											{q.points || 1} {q.points === 1 ? "point" : "points"}
										</span>
									</div>
									<p className="font-bold text-lg leading-relaxed">
										{idx + 1}. {q.question}
									</p>
								</div>
								{!isPublished && (
									<button
										type="button"
										onClick={() => onDelete(idx)}
										className="ml-4 px-4 py-2 text-sm bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded font-medium transition-all"
									>
										Delete
									</button>
								)}
							</div>

							{/* Show options for MCQ/Multi-select */}
							{(q.type === "multiple-choice" || q.type === "multi-select") &&
								q.options && (
									<div className="space-y-2">
										{q.options.map((opt, optIdx) => {
											const isCorrect =
												q.type === "multi-select"
													? (Array.isArray(q.answer)
															? q.answer
															: [q.answer]
														).includes(String(optIdx))
													: q.answer === String(optIdx);

											return (
												<div
													key={optIdx}
													className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
														isCorrect
															? "bg-gray-800 text-white font-bold"
															: "bg-gray-50 text-gray-700"
													}`}
												>
													{q.type === "multi-select" && isCorrect && (
														<span className="text-green-400">✓</span>
													)}
													<span className="font-bold mr-2">
														{String.fromCharCode(65 + optIdx)}.
													</span>
													{opt}
												</div>
											);
										})}
									</div>
								)}

							{/* Long answer note */}
							{q.type === "long-answer" && (
								<p className="text-sm text-gray-500 italic">
									Students will provide written responses for manual grading.
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default QuestionList;
