import { Request, Response } from "express";
import { AccessService } from "../services/access.service";

export class AccessController {
  private readonly accessService;
  constructor(accessService?: AccessService) {
    this.accessService = accessService ?? new AccessService();
  }
  public issueAccessToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;
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
  public getUserInfo = async (req: Request, res: Response) => {
    try {
      const result: any = await this.accessService.getUser((req as any).userId);
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
