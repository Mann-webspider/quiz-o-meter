
const randomId = ()=>{
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    var id = ""
    for(let i =0;i<7;i++){
        id = id.concat(alphabets.charAt(Math.floor(Math.random() * alphabets.length)))
    }
    
    return id
}
module.exports= randomId