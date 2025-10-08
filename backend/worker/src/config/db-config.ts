import mongoose from "mongoose";
import { ENV } from "../constants/env.ts";


export async function connectDB() {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("MongoDB connected:", ENV.MONGO_URI);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
