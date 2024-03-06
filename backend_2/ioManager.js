const { Server } = require("socket.io");
const {http} = require("http")
// const io = new Server(3001, { /* options */ });
const server = http.createServer();


export default class IoManager {
      

    // singletons
     getIo() {
        if (!this.io) {
            const io = new Server(server, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });
            this.io = io;
        }
        return this.io;
    }

}   