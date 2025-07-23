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
  public encryptToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
  };

  public compareTokens = (
    encrypedToken: string,
    refeshtoken: string
  ): boolean => {
    const hashedToken = this.encryptToken(refeshtoken);
    return encrypedToken === hashedToken;
  };
  public genrateAccessToken = (user_id: string) => {
    return this.jwt.sign({ user_id }, "idid");
  };
  public verifyAccessToken = (token: string) => {
    return this.jwt.verify(token, "idid");
  };

  public verifyRefreshToken(token: string): any {
    try {
      return this.jwt.verify(token, "iid");
    } catch (err) {
      return null;
    }
  }
}
