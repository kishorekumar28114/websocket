"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const router = useRouter()

  const handleRegister = async () => {

    const res = await fetch("/api/register",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    })

    const data = await res.json()

    if(res.ok){
      alert("User created")
      router.push("/login")
    } else {
      alert(data.error)
    }
  }

  return(
    <div className="flex flex-col items-center mt-20 gap-4">

      <h1 className="text-2xl font-bold">
        Register
      </h1>

      <input
        placeholder="username"
        className="border p-2"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
      />

      <input
        placeholder="password"
        type="password"
        className="border p-2"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white p-2"
      >
        Register
      </button>

    </div>
  )
}