import Button from "../Button";

function StudentCard({ student, onViewDetails }) {
	return (
		<div className="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-all">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="bg-gray-800 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl">
						{student.student.charAt(0).toUpperCase()}
					</div>
					<div>
						<p className="font-bold text-xl">{student.student}</p>
						<p className="text-sm text-gray-600 mt-1">
							Status:{" "}
							<span
								className={`font-bold ${
									student.status === "Done"
										? "text-green-600"
										: "text-yellow-600"
								}`}
							>
								{student.status}
							</span>
						</p>
					</div>
				</div>
				<div className="flex items-center gap-6">
					<div className="text-right">
						<p className="text-sm text-gray-600 uppercase tracking-wider">
							Score
						</p>
						<p className="text-3xl font-bold">{student.marks}</p>
					</div>
					{student.status === "Done" && (
						<Button
							text="View Details"
							click={() => onViewDetails(student.studentId)}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export default StudentCard;
