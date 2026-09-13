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
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Routes
app.use("/api/appointments", appointmentsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root endpoint for Vercel deployment verification
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Appointment Booking API is live",
    endpoints: {
      health: "/health",
      appointments: "/api/appointments",
    },
  });
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

// Start listening when running standalone/locally (Vercel uses exported app)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
