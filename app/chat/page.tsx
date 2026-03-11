"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

export default function ChatPage(){

  const [socket,setSocket] = useState<Socket | null>(null)
  const [message,setMessage] = useState("")
  const [messages,setMessages] = useState<any[]>([])
  const [typingUser,setTypingUser] = useState("")

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // connect socket
  useEffect(()=>{

    const newSocket = io("http://localhost:4000",{
      withCredentials:true
    })

    setSocket(newSocket)

    newSocket.on("connect",()=>{
      console.log("Connected to socket:", newSocket.id)
    })

    newSocket.on("receive_message",(data)=>{
      console.log("incoming message:",data)
      setMessages(prev=>[...prev,data])
    })

    newSocket.on("chat_history",(history)=>{
      console.log("chat history:",history)
      setMessages(history)
    })

    newSocket.on("user_typing",(data)=>{
      setTypingUser(data.username + " is typing...")
    })

    newSocket.on("user_stop_typing",()=>{
      setTypingUser("")
    })

    return ()=>{
      newSocket.disconnect()
    }

  },[])

  // auto scroll
  useEffect(()=>{
    chatEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  const sendMessage = ()=>{

    if(!message.trim()) return
    if(!socket) return

    socket.emit("send_message",{
      message:message
    })

    setMessage("")
    socket.emit("stop_typing")

  }

  const handleTyping = (value:string)=>{

    setMessage(value)

    if(!socket) return

    socket.emit("typing")

    if(typingTimeout.current){
      clearTimeout(typingTimeout.current)
    }

    typingTimeout.current = setTimeout(()=>{
      socket.emit("stop_typing")
    },1000)

  }

  return(

    <div className="flex flex-col items-center mt-10">

      <h1 className="text-3xl font-bold">
        Group Chat
      </h1>

      <div className="border w-96 h-80 overflow-y-scroll mt-4 p-2">

        {messages.map((msg,index)=>(
          <p key={index}>
            <b>{msg.username}:</b> {msg.message}
          </p>
        ))}

        <div ref={chatEndRef}></div>

      </div>

      <p className="text-sm text-gray-500 mt-2">
        {typingUser}
      </p>

      <div className="flex mt-4 gap-2">

        <input
          className="border p-2"
          value={message}
          onChange={(e)=>handleTyping(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2"
        >
          Send
        </button>

      </div>

    </div>
  )
}