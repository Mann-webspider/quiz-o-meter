const { db } = require("./connect");

function formatForTable(data){
    const correct = data.submissions.filter((dt)=>(dt.isCorrect == true))
    console.log(data.submissions.length == 0?"Pending":"Done");
const dt = {
    id: data._id,
    student: data.username,
    status: data.submissions.length != 0  ? "Done" : "Pending",
    marks: `${correct.length}/${data.submissions.length}`
}
return dt
}

function studentsTableFormat(list){
    const nw =list?.map((data)=>{
        return formatForTable(data)
    })
    return nw
}

async function populateParticipants(doc){
    if (doc) {
        // Step 2: Extract participant IDs from the room document
        const participantIds = doc.participants;
    
        // Step 3: Query the referenced collection (e.g., users)
        const participants = await db.collection("users").find({ _id: { $in: participantIds } }).toArray();
        
        // Step 4: Populate the participants field in the room document
        doc.participants = participants;
        
        
        return doc.participants
      } else {
        console.log("Room not found");
      }
}

module.exports ={formatForTable,populateParticipants,studentsTableFormat}