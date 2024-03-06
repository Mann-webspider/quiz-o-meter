const express = require("express");
const app = express();
const teacher = require("./routes/teacher")

app.use("/api/teachers",teacher)
app.use("/api/student",student)

app.listen(3000,()=>{
    console.log("listening on port 3000");
})