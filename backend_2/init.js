const IoManager = require("./ioManager")
const QuizManager = require("./src/QuizManager")


var newManager;

newManager = new QuizManager()

const io = new IoManager().getIo()
module.exports={newManager , io }