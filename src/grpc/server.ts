import * as grpc from "@grpc/grpc-js";
import { SessionServiceService } from "./generated/session";
import { sessionServiceHandlers } from "./services/session.service";

import { AccessServiceService } from "./generated/access";
import { accessServiceHandlers } from "./services/access.service";

export async function createGrpcServer() {
  const server = new grpc.Server();
  server.addService(SessionServiceService, sessionServiceHandlers);
  server.addService(AccessServiceService, accessServiceHandlers);
  return server;
}
