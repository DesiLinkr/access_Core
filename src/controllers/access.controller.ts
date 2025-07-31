import { Request, Response } from "express";
import { AccessTokenService } from "../services/accessToken.service";

export class AccessTokenController {
  private readonly accessTokenservice;
  constructor(accessTokenservice?: AccessTokenService) {
    this.accessTokenservice = accessTokenservice ?? new AccessTokenService();
  }
  public issueAccessToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;
    try {
      if (!(req as any).clientInfo) {
        return res.status(400).json({ message: "bad request" });
      }

      const { ip, user_agent } = (req as any).clientInfo;
      const result: any = await this.accessTokenservice.generateFromRefresh(
        refreshToken,
        ip,
        user_agent
      );
      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
  public getUserInfo = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!(req as any).clientInfo) {
        return res.status(400).json({ message: "bad request" });
      }
      const { ip, user_agent } = (req as any).clientInfo;
      const result: any = await this.accessTokenservice.getUser(
        authHeader,
        ip,
        user_agent
      );
      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
}
