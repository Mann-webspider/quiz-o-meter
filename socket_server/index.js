// socket io server configuration
const { default: axios } = require('axios');
const IoManager = require('./IoManager');
const inst = new IoManager().getState()
const io = inst.getIo()

// Define event handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Handle custom events
  socket.on('chat message', (msg) => {
    // console.log('Message:', msg);
    // Broadcast the message to all connected clients
    io.emit('chat message', msg);
  });
  
  socket.on("join_room", async (data)=>{
    
    socket.join(data.roomId)
    // newManager.addStudent(data.username,data.roomId)
    const result = await axios.post("http://server:3001/api/students/rooms/joinRoom",{username:data.username,roomId:data.roomId}).then((data)=>{
        return data.data
    }).catch((e)=>{
        console.log("error");
    })
    socket.emit("joined-room",`userCreated`)
    // socket.join(data.roomId)-
})
  

  
});

const sendData = async ()=>{

        
    try{
        // const result = newManager.getStudentName("123456")
        const result = await axios.get("http://server:3001/api/students/rooms/123456/participants").then((data)=>{
            return data.data;
        }).catch((e)=>{
            console.log(e);
        })
        
        if(result == null || result == undefined  || result == {}){
            // console.log("i have been called by error");
            io.emit("getStudents",[""])
            return
        }
        // console.log("i have been called");
        io.emit("getStudents",result)

    }catch(e){
        console.log("err");
    }finally {
        setTimeout(sendData, 3000); // Recursively call fetchData after 3000 ms
    }


}
sendData()


