const { UserM, RoomM, QuizM, QuizManagerModel } = require("../db/model");
const Quiz = require("../src/Quiz");

const storeQuizesFromDb = (listOfQuiz) => {
	const temp = [];
	listOfQuiz.map((quiz) => {
		const newQuiz = new Quiz(
			quiz.question,
			quiz.options,
			quiz.answer,
			quiz.roomId,
			quiz._id,
		);
		temp.push(newQuiz);
		return quiz;
	});
	return temp;
};
const storeQuizesFromUser = (listOfQuiz, roomId) => {
	const temp = [];
	listOfQuiz.map((quiz) => {
		const newQuiz = new Quiz(quiz.question, quiz.options, quiz.answer, roomId);

		temp.push(newQuiz);
		return quiz;
	});
	return temp;
};

async function findById(collection, id) {
	switch (collection) {
		case "users":
			return await UserM.findById(id);

		case "rooms":
			return await RoomM.findById(id);

		case "quizes":
			return await QuizM.find({ roomId: id });

		case "manager":
			return await QuizManagerModel.findOne({ roomId: id });

		default:
			return "dont have that modle";
	}
	// const res = await
}

module.exports = { storeQuizesFromDb, storeQuizesFromUser, findById };
