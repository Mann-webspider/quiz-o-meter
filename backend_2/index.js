const express = require("express");

const cookieParser = require("cookie-parser");
// create express application 
const app = express();
// const init = require("./init")
const cors = require("cors");
// const { default: mongoose } = require("mongoose");
const conn = require("./db/connect");

// middlewares 
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())



// load routes 
const teacher = require("./routes/teacher")
const student = require("./routes/student");
// use routes 
app.use("/api/teachers",teacher)
app.use("/api/students",student)


app.listen(3001,()=>{
    console.log("listening on port 3001");
})


module.exports = app