const { Schema, default: mongoose } = require("mongoose");

const UserSchema = new Schema(
  {
    
    username: { type: String },
    role: { type: String, default: "student" },
    roomId:{type:String},
    submissions:{type:[{type:Object,default:null}] , default:null}
  },
  { timestamps: true }
);

const QuizSchema = new Schema(
  {
    question: { type: String },
    options: [{ type: String }],
    answer: { type: String },
    roomId: { type: String, required: true },
  },
  { timestamps: true }
);

const RoomSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId },
    participants: [{ type: Schema.Types.ObjectId, default: [] ,ref:"Users"}],
    roomId: { type: String, unique: true },
    quizzes:  {type: Schema.Types.Map,of:Schema.Types.ObjectId , default: null ,ref:"Quizes"}},
  { timestamps: true }
);
const QuizManagerSchema = new mongoose.Schema({
  roomId: {type:String},
  roomObj:{type:Schema.Types.ObjectId, ref:"Rooms"}
});


const QuizManagerModel = mongoose.model("QuizManager", QuizManagerSchema);
const UserM = mongoose.model("Users", UserSchema);
const QuizM = mongoose.model("Quizes", QuizSchema);
const RoomM = mongoose.model("Rooms", RoomSchema);

module.exports = { UserM, QuizM, RoomM, QuizManagerModel };
