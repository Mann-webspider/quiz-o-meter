const express = require("express")
const {createServer} = require("node:http");
const { Server } = require('socket.io');
const cors = require("cors")

const app = express();
app.use(cors({origin:"*",methods:['GET','POST']}))
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    cors:{origin:'*',methods:['GET','POST']}   
   
  });
app.get("/",(req,res)=>{
    res.send("ok")
})
  io.on('connection',(socket)=>{
    socket.on("room",(arg)=>{
        console.log(arg);
    })
  })


  server.listen(3000, () => {
    console.log(`server running at http://localhost:3000`);
  });