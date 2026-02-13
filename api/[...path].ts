import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { connectDatabase } from "../server/db.js";
import { registerRoutes } from "../server/routes.js";

let appPromise: Promise<express.Express> | null = null;

async function createApp() {
  const app = express();
  const httpServer = createServer(app);

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as Request & { rawBody: unknown }).rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));

  await connectDatabase();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  return app;
}

async function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return app(req, res);
}
