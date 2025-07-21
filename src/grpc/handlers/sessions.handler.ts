import {
  CreateSessionRequest,
  CreateSessionResponse,
} from "../generated/session";
import { SessionService } from "../../services/session.service";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
export class SessionsHandlers {
  private readonly SessionService: SessionService;
  constructor() {
    this.SessionService = new SessionService();
  }
  public genrateSession = async (
    call: ServerUnaryCall<CreateSessionRequest, CreateSessionResponse>,
    callback: sendUnaryData<CreateSessionResponse>
  ) => {
    try {
      const { userId, ip, userAgent } = call.request;

      const session = await this.SessionService.createSession(
        userId,
        ip,
        userAgent
      );
      callback(null, { refreshToken: session.refreshToken });
    } catch (error: any) {
      callback(error, null);
    }
  };
}
