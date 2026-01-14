import { Request, Response } from "express";
import { AccessService } from "../services/access.service";
import { AccessVerifier } from "../services/accessVerifier.service";

export class AccessController {
  private readonly accessService;
  private verifier;
  constructor(accessService?: AccessService, accessVerifier?: AccessVerifier) {
    this.accessService = accessService ?? new AccessService();
    this.verifier = accessVerifier ?? new AccessVerifier();
  }
  public verifyAccessToken = async (req: Request, res: Response) => {
    try {
      const { token, ip, userAgent } = req.body;
      const result: any = await this.verifier.verify(token, ip, userAgent);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };

  public issueAccessToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;
    console.log("hhelo");

    console.log(refreshToken);

    try {
      if (!(req as any).clientInfo) {
        return res.status(400).json({ message: "bad request" });
      }

      const { ip, user_agent } = (req as any).clientInfo;
      const result: any = await this.accessService.generateFromRefresh(
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

  public acesssHistory = async (req: Request, res: Response) => {
    try {
      const result: any = await this.accessService.getHistory(
        (req as any).userId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
}
