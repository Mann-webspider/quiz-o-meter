const express = require("express");
const app = express();
const teacher = require("./routes/teacher")
const student = require("./routes/student");
const cookieParser = require("cookie-parser");
// const init = require("./init")

app.use(express.json())
app.use(cookieParser())

app.use("/api/teachers",teacher)
app.use("/api/student",student)

app.listen(3001,()=>{
    console.log("listening on port 3001");
})