require("dotenv").config()

const { Server } = require("socket.io")
const http = require("http")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

mongoose.connect(process.env.MONGO_URI)

mongoose.connection.once("open",()=>{
  console.log("MongoDB connected")
})

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
    origin:[
      "http://localhost:3000",
      "https://websocket-seven.vercel.app"
    ],
    methods:["GET","POST"]
  }
})

io.on("connection",async(socket)=>{

  try{

    const token = socket.handshake.auth.token

    if(!token){
      console.log("No token → disconnect")
      socket.disconnect()
      return
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const username = decoded.username

    console.log("User connected:",username)

    const messages = await Message.find()
      .sort({createdAt:1})
      .limit(50)

    socket.emit("chat_history",messages)

    socket.on("send_message",async(data)=>{

      const newMessage = new Message({
        username:username,
        message:data.message
      })

      await newMessage.save()

      io.emit("receive_message",{
        username,
        message:data.message
      })

    })

    socket.on("typing",()=>{
      socket.broadcast.emit("user_typing",{username})
    })

    socket.on("stop_typing",()=>{
      socket.broadcast.emit("user_stop_typing")
    })

  }catch(err){

    console.log("Auth failed:",err.message)
    socket.disconnect()

  }

})

const PORT = process.env.PORT || 4000

server.listen(PORT,()=>{
  console.log("WebSocket server running on port",PORT)
})