import mongoose from "mongoose"

let cached = global as typeof globalThis & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn
  }

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  if (!cached.mongoose.promise) {
    cached.mongoose.promise = mongoose.connect(MONGODB_URI)
  }

  cached.mongoose.conn = await cached.mongoose.promise
  return cached.mongoose.conn
}
