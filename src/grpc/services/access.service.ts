import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
  AccessServiceServer,
  AccessVerifierRequest,
  AccessVerifierResponse,
} from "../generated/access";
import { AccessHandlers } from "../handlers/access.handler";

const accesshandlers = new AccessHandlers();
export const accessServiceHandlers: AccessServiceServer = {
  verify: accesshandlers.verifyAccessToken,
};
