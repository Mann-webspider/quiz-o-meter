function QuestionTypeSelector({ selectedType, onTypeChange }) {
	const types = [
		{
			value: "multiple-choice",
			label: "Multiple Choice",
			icon: "⭕",
			description: "Single correct answer",
		},
		{
			value: "multi-select",
			label: "Multi Select",
			icon: "☑️",
			description: "Multiple correct answers",
		},
		{
			value: "long-answer",
			label: "Long Answer",
			icon: "📝",
			description: "Written response",
		},
	];

	return (
		<div name="question-type-selector">
			<label
				htmlFor="question-type-selector"
				className="block text-sm font-medium mb-3 uppercase tracking-wider text-gray-700"
			>
				Question Type
			</label>
			<div className="grid grid-cols-3 gap-4">
				{types.map((type) => (
					<button
						key={type.value}
						type="button"
						onClick={() => onTypeChange(type.value)}
						className={`p-4 border-2 rounded-lg text-left transition-all ${
							selectedType === type.value
								? "border-black bg-black text-white"
								: "border-gray-300 hover:border-gray-500"
						}`}
					>
						<div className="text-3xl mb-2">{type.icon}</div>
						<p className="font-bold text-sm">{type.label}</p>
						<p className="text-xs opacity-80 mt-1">{type.description}</p>
					</button>
				))}
			</div>
		</div>
	);
}

export default QuestionTypeSelector;
