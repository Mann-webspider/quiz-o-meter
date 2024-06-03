// socket io server configuration
const { default: axios } = require("axios");
const io = require("./IoManager");
const { db } = require("./connect");
const {formatForTable,populateParticipants, studentsTableFormat} = require("./utils");

async function watchUpdate(socket,roomId) {
  console.log("MongoDB connection successful");

  // Access the collection directly and perform queries
  
  const collection = db.collection("users");
  // socket.emit("user-insert","i am from watch update")
  // Find all documents in the collection
  const changeStream = await collection.watch();
  //   // Subscribe to events emitted by the change stream 
  changeStream.on("change", async (change) => {
    
    
    
    if (change.operationType == "update") {
      console.log("Change event:", change.documentKey._id);
      user = await db
        .collection("users")
        .findOne({ _id: change.documentKey._id});
        if( user.roomId == roomId){
          const final = formatForTable(user)
          console.log(final);
          socket.emit("user-update", final)
        
        
      }
      //  socket.emit("user-update",user)
    }else{
      console.log("Change event:", change.documentKey._id);
      user = await db 
        .collection("users")
        .findOne({ _id: change.documentKey._id});
        if( user?.roomId == roomId){
          // console.log(user);
          const final = formatForTable(user)
          console.log(final);
          socket.emit("user-insert", final)
        
        
      }
    }
    return ()=>{}
  });
}
const sendData = async (sck, roomId) => {
  try {
    
    
    var user;
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
    // sck.emit("user-insert","i am from sendData")
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
  socket.on("user-IU",(roomId)=>{

    sendData(socket,roomId);
  })
  socket.on("user",async (roomId) => {
    const room =await db.collection("rooms").findOne({roomId : roomId.toString()})
    const students = await populateParticipants(room)
    const res = studentsTableFormat(students)
    // console.log(res);
    socket.emit("user",res?res:[])
   
    
  });
  // socket.on("user-insert", (roomId) => {
    
  //   sendData(socket,roomId);
   
    
  // });
});

