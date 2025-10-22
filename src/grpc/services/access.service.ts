import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
  AccessServiceServer,
  AccessVerifierRequest,
  AccessVerifierResponse,
} from "../generated/access";
import { AccessHandlers } from "../handlers/access.handler";
import { SessionsHandlers } from "../handlers/sessions.handler";

const sessionsHandlers = new SessionsHandlers();
const accesshandlers = new AccessHandlers();
export const accessServiceHandlers: AccessServiceServer = {
  verify: accesshandlers.verifyAccessToken,
  createSession: sessionsHandlers.genrateSession,
  delAllsessions: sessionsHandlers.delAllSession,
};
