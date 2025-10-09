import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.ts";
import uploadRouter from "./routes/upload.ts";
import assetsRouter from "./routes/assets.ts";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ENV } from "./constants/env.ts";

dotenv.config();
const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173", // local Vite
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:4000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false,
  })
);
app.use(express.json());

// Parse JSON bodies (optional larger limit)
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/upload", uploadRouter);
app.use("/assets", assetsRouter);

// Start server only after DB connection
const PORT = ENV.PORT; //process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`API running on http://localhost:${PORT}`)
  );
});
