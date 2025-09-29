import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import uploadRouter from "./routes/upload.js";
import assetsRouter from "./routes/assets.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

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

// Serve uploads folder statically
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Parse JSON bodies (optional larger limit)
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/upload", uploadRouter);
app.use("/assets", assetsRouter);

// Start server only after DB connection
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`API running on http://localhost:${PORT}`)
  );
});
