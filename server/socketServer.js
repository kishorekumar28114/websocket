require("dotenv").config({ path: ".env.local" })

const { Server } = require("socket.io")
const http = require("http")
const mongoose = require("mongoose")
const cookie = require("cookie")
const jwt = require("jsonwebtoken")

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)

mongoose.connection.once("open",()=>{
  console.log("MongoDB connected in WebSocket server")
})

// message model
const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    username:String,
    message:String,
    createdAt:{
      type:Date,
      default:Date.now
    }
  })
)

const server = http.createServer()

const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000",
    credentials:true
  }
})

io.on("connection",async(socket)=>{

  try{

    const cookies = socket.handshake.headers.cookie

    if(!cookies){
      console.log("No cookies → disconnect")
      socket.disconnect()
      return
    }

    const parsedCookies = cookie.parse(cookies)

    const token = parsedCookies.token

    if(!token){
      console.log("No token → disconnect")
      socket.disconnect()
      return
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    const username = decoded.username

    console.log("User connected:",username)

    // send chat history
    const messages = await Message.find()
      .sort({createdAt:1})
      .limit(50)

    socket.emit("chat_history",messages)

    // receive new message
    socket.on("send_message",async(data)=>{

      console.log("MESSAGE RECEIVED:",data)

      const newMessage = new Message({
        username:username,
        message:data.message
      })

      await newMessage.save()

      console.log("MESSAGE SAVED")

      io.emit("receive_message",{
        username:username,
        message:data.message
      })

    })
    socket.on("typing",()=>{

  socket.broadcast.emit("user_typing",{
    username:username
  })

})

socket.on("stop_typing",()=>{

  socket.broadcast.emit("user_stop_typing")

})

  }catch(err){

    console.log("Auth failed:",err.message)
    socket.disconnect()

  }

})

server.listen(4000,()=>{
  console.log("WebSocket server running on port 4000")
})