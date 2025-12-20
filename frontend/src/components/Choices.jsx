import Input from "./Input";

function Choices(props) {
	// const [choice, setChoice] = useState();
	const choice = new Array(props.number).fill("");

	return (
		<div className="h-full w-full flex  items-center">
			<ul className="flex flex-col gap-16   ">
				{choice.map((data, idx) => (
					<li className="flex justify-center" key={`li${idx}`}>
						<label className="flex justify-center items-center">
							<input
								type="radio"
								name="answer"
								key={data * 2}
								value={idx}
								className="relative top-8 right-3"
								{...props.register("answer")}
							/>
							<Input
								placeholder={`option ${idx + 1}`}
								key={`input-${idx}`}
								register={{ ...props.register(`options.${idx}`) }}
							/>
						</label>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Choices;
