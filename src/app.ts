import express, { Application } from "express";
import routes from "./routes/index.routes";
import "dotenv/config";
console.log("DB URL exists:", !!process.env.DATABASE_URL);
console.log("DB Host:", new URL(process.env.DATABASE_URL!).host);

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function checkDB() {
  try {
    await prisma.$connect();
    console.log("✅ DB connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
}

checkDB();

import cors from "cors";
import cookieParser from "cookie-parser";
class App {
  private express: Application;
  private PORT: number;
  constructor() {
    this.PORT = Number(process.env.PORT);
    this.express = express();
    this.middleware();
    this.routes();
    this.notFoundHandler();
  }
  private middleware = () => {
    this.express.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    );
    this.express.use(cookieParser());
    this.express.use(express.json());
  };
  // Routes
  private routes = () => {
    this.express.use("/api", routes);
  };
  // 404 handler
  private notFoundHandler = () => {
    this.express.use((_req, res) => {
      res.status(404).json({ message: "Route not found" });
    });
  };
  public getInstance = (): Application => {
    return this.express;
  };
  public startServers = async (port: number) => {
    this.PORT = this.PORT || port;
    this.express.listen(this.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${this.PORT}`);
    });
  };
}
export default App;
