import express from "express";
import cors from "cors";
import { donationsRouter } from "./routes/donations.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { campsRouter } from "./routes/camps.routes.js";
import { volunteersRouter } from "./routes/volunteers.routes.js";
import { auditRouter } from "./routes/audit.routes.js";

export function createBackendApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "seva-backend", timestamp: new Date().toISOString() });
  });

  // REST API Routes matching mobile, tablet, kaios & pwa apps
  app.use("/api/v1/donations", donationsRouter);
  app.use("/api/v1/events", eventsRouter);
  app.use("/api/v1/camps", campsRouter);
  app.use("/api/v1/volunteers", volunteersRouter);
  app.use("/api/v1/audit", auditRouter);

  return app;
}

