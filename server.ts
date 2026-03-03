import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { apiRouter } from "./server/routes.js";
import { setupWebSockets } from "./server/websockets.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy to handle X-Forwarded-For headers correctly
  app.set("trust proxy", 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev environment to allow inline scripts/styles
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({
    origin: "*", // Adjust in production
  }));
  app.use(express.json());

  // Rate limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
      xForwardedForHeader: false,
      trustProxy: false,
    }
  });
  app.use("/api", apiLimiter, apiRouter);

  const httpServer = createServer(app);
  
  // Setup WebSockets
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    }
  });
  setupWebSockets(io);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
