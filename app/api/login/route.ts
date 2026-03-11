import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  await connectDB()

  const { username, password } = await req.json()

  const user = await User.findOne({ username })

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  )

  const response = NextResponse.json({
  message: "Login successful",
  token
})

  response.cookies.set("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/"
})
  return response
}