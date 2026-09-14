import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import appointmentsRouter from "./routes/appointments.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api/appointments", appointmentsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("[Error]", err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
