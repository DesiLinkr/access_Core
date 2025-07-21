import { SessionsRepository } from "../repositories/sessions.repository";
import { TokenUtil } from "../utils/token.util";

export class SessionService {
  private readonly SessionRepo: SessionsRepository;
  private readonly tokenUtil: TokenUtil;
  constructor(SessionRepo?: SessionsRepository, tokenUtil?: TokenUtil) {
    this.SessionRepo = SessionRepo ?? new SessionsRepository();
    this.tokenUtil = tokenUtil ?? new TokenUtil();
  }
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
