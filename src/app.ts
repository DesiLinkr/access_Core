import express, { Application } from "express";
import routes from "./routes/index.routes";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { createGrpcServer } from "./grpc/server";
import * as grpc from "@grpc/grpc-js";
class App {
  private express: Application;
  private PORT: number;

  constructor() {
    this.PORT = 8083;
    this.express = express();
    this.middleware();
    this.routes();
    this.notFoundHandler();
  }

  private middleware = () => {
    this.express.use(express.json());
    this.express.use(cookieParser());
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

  public startServers = async (port: number) => {
    this.express.listen(this.PORT, () => {
      this.PORT = Number(process.env.PORT) || port;
      console.log(`Server running at http://localhost:${this.PORT}`);
    });

    const grpcServer = await createGrpcServer();
    grpcServer.bindAsync(
      `0.0.0.0:5052`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error(`Server could not start. Error: ${err}`);
          return;
        }
        console.log(`Server is running on port ${port}`);
      }
    );
  };
}

export default App;
