import { request, Request, Response } from "express";
import { SessionService } from "../services/session.service";

export class SessionsController {
  private readonly SessionService: SessionService;
  constructor() {
    this.SessionService = new SessionService();
  }
  public createSession = async (req: Request, res: Response) => {
    try {
      const { userId, ip, userAgent } = req.body;

      const session = await this.SessionService.createSession(
        userId,
        ip,
        userAgent
      );
      console.log(session);

      res.status(200).json({ refreshToken: session.refreshToken });
    } catch (error) {
      console.log(error);

      res.status(500).json("Internal server error");
    }
  };

  public deleteAllUserSession = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      await this.SessionService.deleteAll(userId);
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };

  public deleteAllExpired = async (req: Request, res: Response) => {
    try {
      await this.SessionService.deleteExpired();
      res.status(200).json({ msg: "expired sessions deleted" });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
}
