import * as grpc from "@grpc/grpc-js";
import { SessionServiceService } from "./generated/session";
import { sessionServiceHandlers } from "./services/session.service";

export async function createGrpcServer() {
  const server = new grpc.Server();
  server.addService(SessionServiceService, sessionServiceHandlers);
  return server;
}
