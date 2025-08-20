import { NextFunction, Request, Response } from "express";
import { TokenUtil } from "../utils/token.util";
import { deviceId } from "../cache/deviceId.cache";
import { getClientIp } from "../utils/ip.util";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  const ip = getClientIp(req);
  const user_agent = req.headers["user-agent"];

  if (!ip || !user_agent) {
    return res.status(401).json({
      error: "Missing IP address or User-Agent in request",
    });
  }

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  const tokenUtil = new TokenUtil();
  const decode: any = tokenUtil.verifyAccessToken(token);
  if (!decode) {
    res.status(401).json({ message: "Invalid or expired access token" });
  }

  (req as any).userId = decode.user_id;
  const cache = new deviceId();

  const device_id = await cache.getDeviceid(decode.session_id);
  const currentdevice = tokenUtil.generateDeviceId(
    ip,
    user_agent,
    decode.session_id
  );

  if (device_id != currentdevice) {
    return res.status(403).json({
      error: "Session does not match with current device OR expired",
    });
  }
  next();
};
