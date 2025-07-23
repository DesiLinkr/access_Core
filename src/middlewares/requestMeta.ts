import { NextFunction, Request, Response } from "express";

export function requestMeta(req: Request, res: Response, next: NextFunction) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const user_agent = req.headers["user-agent"];

  if (!ip || !user_agent) {
    return res.status(401).json({
      error: "Missing IP address or User-Agent in request",
    });
  }

  // Attach to request object for later use
  (req as any).clientInfo = {
    ip,
    user_agent,
  };

  next();
}
