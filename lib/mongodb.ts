import mongoose from "mongoose"

const MONGO_URI = process.env.MONGO_URI!

if (!MONGO_URI) {
  throw new Error("MONGO_URI not defined")
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return

   try {
    await mongoose.connect(MONGO_URI)
    console.log("MongoDB Connected Successfully")
  } catch (error) {
    console.log("Connection error:", error)
  }
}
