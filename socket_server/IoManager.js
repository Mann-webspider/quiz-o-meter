const { Server } = require("socket.io");
const http = require("http")
const app = require("./index")
// const db = require("./connect")
// const io = new Server(3001, { /* options */ });
const server = http.createServer(app)


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
server.listen(3003)


module.exports= io