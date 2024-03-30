const { Server } = require("socket.io");
const http = require("http")
const app = require("./index")
// const io = new Server(3001, { /* options */ });
const server = http.createServer(app)


class IoManager {
    instance=null
    constructor() {

        // Create an HTTP server
        // this.server = http.createServer();

        // Initialize socket.io with the HTTP server
        
    }
    getState(){
        if (!IoManager.instance){
            IoManager.instance = new IoManager()
        }
        return IoManager.instance
    }
    // Singleton method to get the socket.io instance
    getIo() {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        server.listen(3003)
        return this.io;
    }
}


module.exports= IoManager