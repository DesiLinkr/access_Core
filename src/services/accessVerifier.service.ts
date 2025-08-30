// src/core/accessVerifier.ts
import { TokenUtil } from "../utils/token.util";
import { deviceId } from "../cache/deviceId.cache";

export class AccessVerifier {
  private tokenUtil = new TokenUtil();
  private cache = new deviceId();

  public async verify(token: string, ip: string, userAgent: string) {
    if (!token) {
      return { valid: false, status: 401, error: "Access token missing" };
    }
    if (!ip || !userAgent) {
      return {
        valid: false,
        status: 401,
        error: "Missing IP address or User-Agent",
      };
    }

    const decode: any = this.tokenUtil.verifyAccessToken(token);
    if (!decode) {
      return { valid: false, status: 401, error: "Invalid or expired token" };
    }

    const device_id = await this.cache.getDeviceid(decode.session_id);
    const currentdevice = this.tokenUtil.generateDeviceId(
      ip,
      userAgent,
      decode.session_id
    );

    if (device_id !== currentdevice) {
      return {
        valid: false,
        status: 403,
        error: "Session does not match with current device OR expired",
      };
    }

    return {
      valid: true,
      status: 200,
      userId: decode.user_id,
      sessionId: decode.session_id,
    };
  }
}
