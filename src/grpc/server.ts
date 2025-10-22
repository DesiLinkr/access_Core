import * as grpc from "@grpc/grpc-js";

import { AccessServiceService } from "./generated/access";
import { accessServiceHandlers } from "./services/access.service";

export async function createGrpcServer() {
  const server = new grpc.Server();
  server.addService(AccessServiceService, accessServiceHandlers);
  return server;
}
