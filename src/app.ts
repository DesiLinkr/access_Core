import express, { Application } from "express";
import routes from "./routes/index.routes";
import "dotenv/config";

class App {
  private express: Application;
  private PORT: number;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.notFoundHandler();
  }

  private middleware = () => {
    this.express.use(express.json());
  };

  private routes = () => {
    this.express.use("/api", routes);
  };

  private notFoundHandler = () => {
    this.express.use((_req, res) => {
      res.status(404).json({ message: "Route not found" });
    });
  };

  public getInstance = (): Application => {
    return this.express;
  };

  public startServer = (port: number) => {
    this.express.listen(this.PORT, () => {
      this.PORT = Number(process.env.PORT) || port;
      console.log(`Server running at http://localhost:${this.PORT}`);
    });
  };
}

export default App;
