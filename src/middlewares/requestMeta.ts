import { NextFunction, Request, Response } from "express";
import { getClientIp } from "../utils/ip.util";

export function requestMeta(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);

  const user_agent = req.headers["user-agent"];

  if (!ip || !user_agent) {
    res.status(401).json({
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
