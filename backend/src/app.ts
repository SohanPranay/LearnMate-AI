import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import assessmentRoutes from "./routes/assessment.routes";
import roadmapRoutes from "./routes/roadmap.routes";
import chatRoutes from "./routes/chat.routes";

import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("📦 Connected to MongoDB"))
    .catch((err) => console.warn("⚠️ MongoDB connection skipped:", err.message));
}

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "LearnMate AI Backend Running",
  });
});

app.use("/api/assessment", assessmentRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/chat", chatRoutes);

export default app;