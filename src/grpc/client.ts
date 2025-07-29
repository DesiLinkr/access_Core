import { credentials } from "@grpc/grpc-js";
import { UserClient } from "./generated/user";

export const grpcClient = new UserClient(
  "localhost:5051",
  credentials.createInsecure()
);
