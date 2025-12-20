import Button from "./Button";

function QuestionBox(props) {
	return (
		<div className={`relative w-4/6 h-5/6 flex justify-center`}>
			<div
				className={`box w-full h-full rounded-2xl bg-[#fff50d] p-4 border-2 border-black absolute z-10`}
			>
				<h2 className="text-3xl font-semibold mb-2">Questions</h2>
				<ul className="overflow-auto h-[80%]">
					{props.question.map((data) => (
						<li
							key={data.id}
							className="bg-white p-4 rounded-lg border-2 border-black my-4 text-lg font-medium tracking-wider"
						>
							{data.question}, {data.options[data.answer]}
						</li>
					))}
				</ul>
				<div className="room">
					<h2>RoomId: {props.roomId}</h2>
					<Button text={"Submit"} click={props.click} />
				</div>
			</div>
			<div
				className={`back w-full h-full rounded-2xl bg-black absolute z-[1] top-3 left-3`}
			></div>
		</div>
	);
}

export default QuestionBox;
