function Input(props) {
	return (
		<div className={`relative block `}>
			<input
				type="text"
				className={`z-10 p-4 pl-8  absolute w-[${props.width}] min-w-96 focus:outline-none placeholder:text-gray-600 tracking-wider rounded-lg border-2 border-black`}
				{...props}
				{...props.register}
			/>
			<div
				className={`z-[1] absolute top-1 w-[${props.width}] min-w-96 left-1 bg-black block  h-16  rounded-lg`}
			>
				{" "}
			</div>
		</div>
	);
}

export default Input;
