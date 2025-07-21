import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";
export class TokenUtil {
  private readonly jwt;
  private readonly crypto;
  constructor() {
    this.jwt = jsonwebtoken;
    this.crypto = crypto;
  }
  public genrateRefeshToken = (user_id: string) => {
    return this.jwt.sign({ user_id }, "iid");
  };

  public decode = (token: string) => {
    return this.jwt.decode(token);
  };
  public encryptToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
  };
  public genrateAccessToken = (user_id: string) => {
    return this.jwt.sign({ user_id }, "idid");
  };
  public verifyAccessToken = (token: string) => {
    return this.jwt.verify(token, "idid");
  };

  public verifyRefreshToken(token: string): any {
    return this.jwt.verify(token, "iid");
  }
}
