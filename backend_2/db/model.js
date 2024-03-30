const { Schema, default: mongoose, SchemaType } = require("mongoose");

const UserSchema = new Schema(
  {
    
    username: { type: String },
    role: { type: String, default: "student" },
  },
  { timestamps: true }
);

const QuizSchema = new Schema(
  {
    question: { type: String },
    Option: { type: [String] },
    answer: { type: String },
    roomId: { type: String, required: true },
  },
  { timestamps: true }
);

const RoomSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId },
    participants: { type: [UserSchema], default: [] },
    roomId: { type: String, unique: true },
    quizzes: { type: [QuizSchema], default: [] },
  },
  { timestamps: true }
);
const QuizManagerSchema = new mongoose.Schema({
  roomsInstance: { type: Object, required: true },
});
const QuizManagerModel = mongoose.model("QuizManager", QuizManagerSchema);

const UserM = mongoose.model("Users", UserSchema);
const QuizM = mongoose.model("Quizes", QuizSchema);
const RoomM = mongoose.model("Rooms", RoomSchema);

module.exports = { UserM, QuizM, RoomM, QuizManagerModel };
