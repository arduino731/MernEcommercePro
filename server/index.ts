import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { connectToDatabase } from "./database";
import { storage } from "./mongoose-storage";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Connect to DB and preload data
(async () => {
  await connectToDatabase();
  await storage.initializeData();
})();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger for /api requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let log = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) log += ` :: ${JSON.stringify(capturedJson)}`;
      if (log.length > 120) log = log.slice(0, 120) + "…";
      console.log(log);
    }
  });

  next();
});

// Register API routes and static client serving
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    throw err;
  });

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Serving full stack app on http://localhost:${port}`);
  });
})();
