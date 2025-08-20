import { deviceId } from "../cache/deviceId.cache";
import { SessionsRepository } from "../repositories/sessions.repository";
import { getUserInfoById } from "../utils/grpc.util";
import { TokenUtil } from "../utils/token.util";

export class AccessService {
  private readonly tokenUtil;
  private readonly SessionRepo;
  private readonly Cache;
  constructor(SessionRepo?: SessionsRepository, tokenUtil?: TokenUtil) {
    this.SessionRepo = SessionRepo ?? new SessionsRepository();
    this.tokenUtil = tokenUtil ?? new TokenUtil();
    this.Cache = new deviceId();
  }
  public generateFromRefresh = async (
    refresh_token: string,
    ip: string,
    user_agent: string
  ) => {
    const decode = this.tokenUtil.verifyRefreshToken(refresh_token);

    if (!decode) {
      return {
        error: "Missing or invalid refresh token",
        status: 400,
      };
    }
    const db = await this.SessionRepo.getSession(
      decode.user_id,
      ip,
      user_agent
    );
    if (!db) {
      return {
        error: "Session does not match with current device OR expired",
        status: 403,
      };
    }
    const isMatched = this.tokenUtil.compareTokens(
      db.refeshtoken,
      refresh_token
    );

    if (!isMatched) {
      return {
        error: "Invalid session",
        status: 401,
      };
    }
    const deviceidexist = await this.Cache.getDeviceid(db.id);

    if (!deviceidexist) {
      const device_id = this.tokenUtil.generateDeviceId(ip, user_agent, db.id);

      await this.Cache.storeDeviceid(db.id, device_id);
    }

    const access_token = this.tokenUtil.genrateAccessToken(
      decode.user_id,
      db.id
    );
    return { access_token };
  };

  getUser = async (id: string) => {
    const result = await getUserInfoById({ id });
    return {
      UserInfo: result,
    };
  };

  getHistory = async (id: string) => {};
}
