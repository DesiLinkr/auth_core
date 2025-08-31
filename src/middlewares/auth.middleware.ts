// src/middleware/verifyAccessToken.ts
import { NextFunction, Request, Response } from "express";
import { getClientIp } from "../utils/ip.util";
import { AccessVerifier } from "../utils/grpc.util";
import { AccessVerifierResponse } from "../grpc/generated/access";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    const result: AccessVerifierResponse = await AccessVerifier({
      token,
      ip,
      userAgent,
    });

    if (!result.valid) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    (req as any).userId = result.userId;
    (req as any).sessionId = result.sessionId;

    next();
  } catch (err) {
    next(err);
  }
};
