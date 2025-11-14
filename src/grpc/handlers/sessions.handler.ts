import {
  CreateSessionRequest,
  CreateSessionResponse,
  delsessionsRequest,
  delsessionsResponse,
} from "../generated/access";
import { SessionService } from "../../services/session.service";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Empty } from "../generated/google/protobuf/empty";
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

  public delAllSession = async (
    call: ServerUnaryCall<delsessionsRequest, delsessionsResponse>,
    callback: sendUnaryData<delsessionsResponse>
  ) => {
    try {
      const { userId } = call.request;
      await this.SessionService.deleteAll(userId);
      callback(null, { msg: "success" });
    } catch (err: any) {
      callback(err, null);
    }
  };
  public delAllExpired = async (
    call: ServerUnaryCall<Empty, delsessionsResponse>,
    callback: sendUnaryData<delsessionsResponse>
  ) => {
    try {
      await this.SessionService.deleteExpired();
      callback(null, { msg: "expired sessions deleted" });
    } catch (err: any) {
      callback(err, null);
    }
  };
}
