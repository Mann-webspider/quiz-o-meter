// socket io server configuration
const { default: axios } = require("axios");
const io = require("./IoManager");
const { db } = require("./connect");

async function watchUpdate(socket,roomId) {
  console.log("MongoDB connection successful");

  // Access the collection directly and perform queries
  
  const collection = db.collection("users");

  // Find all documents in the collection
  const changeStream = await collection.watch();
  //   // Subscribe to events emitted by the change stream
  changeStream.on("change", async (change) => {
    
    // console.log(socket);
    
    if (change.operationType == "update") {
      console.log("Change event:", change.documentKey._id);
      user = await db
        .collection("users")
        .findOne({ _id: change.documentKey._id});
        if( user.roomId == 123456){
          socket.emit("user-update", user)
        
        
      }
      //  socket.emit("user-update",user)
    }
  });
}
const sendData = async (sck, roomId) => {
  try {
    
    
    var user;
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
    
    db.once("open",await watchUpdate(sck,roomId));
  } catch (e) {
    console.log(e);
  } finally {
    // Recursively call fetchData after 3000 ms
  }
};

// Define event handlers
io.on("connection", async (socket) => {
  console.log("A user connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Handle custom events
  socket.on("user-update", (roomId) => {
    
    sendData(socket,roomId);
   
    
  });
});

sendData();
