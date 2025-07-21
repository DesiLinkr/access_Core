import { SessionServiceServer } from "../generated/session";
import { SessionsHandlers } from "../handlers/sessions.handler";

const sessionsHandlers = new SessionsHandlers();
export const sessionServiceHandlers: SessionServiceServer = {
  createSession: sessionsHandlers.genrateSession,
};
