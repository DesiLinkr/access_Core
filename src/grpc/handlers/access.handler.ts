// src/grpc/handlers/access.handler.ts
import {
  AccessVerifierRequest,
  AccessVerifierResponse,
} from "../generated/access";
import { AccessVerifier } from "../../services/accessVerifier.service";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

export class AccessHandlers {
  private verifier;
  constructor(accessVerifier?: AccessVerifier) {
    this.verifier = accessVerifier ?? new AccessVerifier();
  }
  public verifyAccessToken = async (
    call: ServerUnaryCall<AccessVerifierRequest, AccessVerifierResponse>,
    callback: sendUnaryData<AccessVerifierResponse>
  ) => {
    try {
      const { token, ip, userAgent } = call.request;
      const result: any = await this.verifier.verify(token, ip, userAgent);
      const response: AccessVerifierResponse = {
        valid: result.valid,
        userId: result.userId || "",
        sessionId: result.sessionId || "",
        error: result.error || "",
        status: result.status || 500,
      };

      callback(null, response);
    } catch (err: any) {
      callback(err, null);
    }
  };
}
