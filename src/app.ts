import express, { Application } from "express";
import routes from "./routes/index.routes";
import "dotenv/config";
class App {
  private express: Application;
  private PORT: number;
  constructor() {
    this.PORT = Number(process.env.PORT) || 8082;
    this.express = express();
    this.middleware();
    this.routes();
    this.notFoundHandler();
  }
  private middleware = () => {
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
  public startServer = () => {
    this.express.listen(this.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${this.PORT}`);
    });
  };
}
export default App;
