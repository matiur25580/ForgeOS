import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes.js";
import { organizationRouter } from "./routes/organization.routes.js";
import { plantRouter } from "./routes/plant.routes.js";
import { assetRouter } from "./routes/asset.routes.js";
import { env } from "./config/env.js";
import { databaseReady } from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true, methods: ["GET", "POST", "PATCH", "PUT", "DELETE"] }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));

app.use(`${env.API_PREFIX}/auth`, authRouter);
app.use(`${env.API_PREFIX}/organizations`, organizationRouter);
app.use(`${env.API_PREFIX}/plants`, plantRouter);
app.use(`${env.API_PREFIX}/assets`, assetRouter);

app.get(`${env.API_PREFIX}/health/live`, (_req, res) => {
  res.status(200).json({ success: true, data: { status: "live", service: "forgeos-api" } });
});
app.get(`${env.API_PREFIX}/health/ready`, (_req, res) => {
  const ready = databaseReady();
  res.status(ready ? 200 : 503).json({ success: ready, data: { status: ready ? "ready" : "not_ready", dependencies: { mongodb: ready ? "connected" : "disconnected" } } });
});
app.use(notFoundHandler);
app.use(errorHandler);
