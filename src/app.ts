import express, { Application } from "express";
import routes from "./routes/index.routes";
import "dotenv/config";
import * as grpc from "@grpc/grpc-js";
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
        origin: "http://localhost:3001",
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
