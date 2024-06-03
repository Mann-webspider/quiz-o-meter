const express = require("express");
var session = require('express-session')
// const cookieParser = require("cookie-parser");
// create express application 
const app = express();
// const init = require("./init")
const cors = require("cors");
// const { default: mongoose } = require("mongoose");
const conn = require("./db/connect");
var flash = require('connect-flash');


// middlewares 
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
}))
app.use(express.json())
// app.use(cookieParser())
app.use(flash())
app.use(session({
    secret:"your-secret-key",
    saveUninitialized:false,
    resave: false,
    cookie: {
        maxAge: 1000*60*10
    }
}))


// load routes 
const teacher = require("./routes/teacher")
const student = require("./routes/student");
// use routes 
app.get("/test",(req,res)=>{
    if(req.session.visited){
        req.session.visited+=1
    }else{

        req.session.visited=1
    }
    res.send({'session':req.session,'sessionId':req.session.id})
})
app.use("/api/teachers",teacher)
app.use("/api/students",student)


app.listen(3001,()=>{
    console.log("listening on port 3001");
})


module.exports = app