import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import appointmentsRouter from "./routes/appointments.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

// Routes
app.use("/api/appointments", appointmentsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("[Error]", err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

export default app;
