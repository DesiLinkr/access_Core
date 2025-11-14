import { deviceId } from "../cache/deviceId.cache";
import { SessionsRepository } from "../repositories/sessions.repository";
import { TokenUtil } from "../utils/token.util";

export class SessionService {
  private readonly Cache;

  private readonly SessionRepo: SessionsRepository;
  private readonly tokenUtil: TokenUtil;
  constructor(SessionRepo?: SessionsRepository, tokenUtil?: TokenUtil) {
    this.SessionRepo = SessionRepo ?? new SessionsRepository();
    this.tokenUtil = tokenUtil ?? new TokenUtil();
    this.Cache = new deviceId();
  }
  deleteExpired = async () => {
    await this.SessionRepo.removeExpiredsessions();
  };
  deleteAll = async (user_id: string) => {
    const result = await this.SessionRepo.getAllSessionbyId(user_id);
    await this.SessionRepo.deleteSessionbyUserId(user_id);
    for (let i = 0; i < result.length; i++) {
      await this.Cache.delAllDeviceid(result[i].id);
    }
  };
  public createSession = async (
    user_id: string,
    ip: string,
    user_agent: string
  ) => {
    const sessionsExits: any = await this.SessionRepo.getSession(
      user_id,
      ip,
      user_agent
    );
    let refreshToken;
    if (!sessionsExits) {
      refreshToken = this.tokenUtil.genrateRefeshToken(user_id);
      const encryptedToken = this.tokenUtil.encryptToken(refreshToken);
      await this.SessionRepo.storeSession(
        user_id,
        encryptedToken,
        ip,
        user_agent
      );
    } else {
      refreshToken = this.tokenUtil.genrateRefeshToken(user_id);
      const newEncryptedtoken = this.tokenUtil.encryptToken(refreshToken);
      await this.SessionRepo.updateSessiontoken(
        newEncryptedtoken,
        sessionsExits.id
      );
    }
    return { refreshToken };
  };
}
