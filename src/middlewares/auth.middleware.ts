import { NextFunction, Request, Response } from "express";
import { TokenUtil } from "../utils/token.util";
import { SessionsRepository } from "../repositories/sessions.repository";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const user_agent = req.headers["user-agent"];

  if (!ip || !user_agent) {
    return res.status(401).json({
      error: "Missing IP address or User-Agent in request",
    });
  }
  const sessionRepo = new SessionsRepository();
  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const tokenUtil = new TokenUtil();
    const decode: any = tokenUtil.verifyAccessToken(token);

    const session: any = await sessionRepo.getSessionbyId(decode.session_id);
    if (!session || session.ip !== ip || session.user_agent != user_agent) {
      return res.status(403).json({
        error: "Session does not match with current device OR expired",
      });
    }

    (req as any).userId = decode.user_id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};
