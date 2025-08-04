import { SessionsRepository } from "../repositories/sessions.repository";
import { getUserInfoById } from "../utils/grpc.util";
import { TokenUtil } from "../utils/token.util";

export class AccessTokenService {
  private readonly tokenUtil;
  private readonly SessionRepo;
  constructor(SessionRepo?: SessionsRepository, tokenUtil?: TokenUtil) {
    this.SessionRepo = SessionRepo ?? new SessionsRepository();
    this.tokenUtil = tokenUtil ?? new TokenUtil();
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
    const access_token = this.tokenUtil.genrateAccessToken(
      decode.user_id,
      db.id
    );
    return { access_token };
  };

  getUser = async (authHeader: any, ip: string, user_agent: string) => {
    const token = this.tokenUtil.extractToken(authHeader);

    if (!token) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }
    const decode: any = this.tokenUtil.verifyAccessToken(token);
    const session: any = await this.SessionRepo.getSessionbyId(
      decode.session_id
    );
    if (!session || session.ip !== ip || session.user_agent != user_agent) {
      return {
        error: "Session does not match with current device OR expired",
        status: 403,
      };
    }
    const result = await getUserInfoById({ id: session.user_id });
    return {
      UserInfo: result,
    };
  };
}
