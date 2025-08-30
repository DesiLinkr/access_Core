// src/middleware/verifyAccessToken.ts
import { NextFunction, Request, Response } from "express";
import { getClientIp } from "../utils/ip.util";
import { AccessVerifier } from "../services/accessVerifier.service";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  const verifier = new AccessVerifier();
  const result = await verifier.verify(token || "", ip, userAgent);

  if (!result.valid) {
    return res.status(result.status).json({ error: result.error });
  }

  (req as any).userId = result.userId;
  (req as any).sessionId = result.sessionId;

  next();
};
