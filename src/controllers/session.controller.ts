import { Request, Response } from "express";
import { SessionService } from "../services/session.service";

export class SessionController {
  private readonly sessionService;

  constructor(sessionService?: SessionService) {
    this.sessionService = sessionService ?? new SessionService();
  }

  public verifySession = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!(req as any).clientInfo) {
        return res.status(400).json({ message: "bad request" });
      }

      const { ip, user_agent } = (req as any).clientInfo;

      const result: any = await this.sessionService.verify(
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
}
