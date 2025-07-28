import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";
import { Request } from "express";
export class TokenUtil {
  private readonly jwt;
  private readonly crypto;
  constructor() {
    this.jwt = jsonwebtoken;
    this.crypto = crypto;
  }
  public genrateRefeshToken = (user_id: string) => {
    return this.jwt.sign({ user_id }, `${process.env.RefreshToken}`, {
      expiresIn: "7d",
    });
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
  public genrateAccessToken = (user_id: string, session_id: string) => {
    return this.jwt.sign(
      { user_id, session_id },
      `${process.env.AccessToken}`,
      {
        expiresIn: "15m",
      }
    );
  };
  public verifyAccessToken = (token: string) => {
    return this.jwt.verify(token, `${process.env.AccessToken}`);
  };

  public verifyRefreshToken(token: string): any {
    try {
      return this.jwt.verify(token, `${process.env.RefreshToken}`);
    } catch (err) {
      return null;
    }
  }

  extractToken = (authHeader: any) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    return authHeader.split(" ")[1];
  };
}
