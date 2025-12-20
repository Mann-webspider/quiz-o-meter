import "./Button.css";
function Button(props) {
	return (
		<div>
			<button
				type={props.type ? "submit" : "button"}
				className="button-50"
				onClick={props.click ? props.click : () => null}
			>
				{props.text}
			</button>
		</div>
	);
}

export default Button;
