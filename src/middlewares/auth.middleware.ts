// src/middleware/verifyAccessToken.ts
import { NextFunction, Request, Response } from "express";
import { getClientIp } from "../utils/ip.util";
import { AccessVerifier } from "../utils/grpc.util";
import { AccessVerifierResponse } from "../grpc/generated/access";
import axios from "axios";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    let result: any;
    if (process.env.ACESS_CORE_ISGRPC == "true") {
      result = await AccessVerifier({
        token,
        ip,
        userAgent,
      });
    } else {
      const { data } = await axios.post(
        `${process.env.GATEWAY_URL}/api/access/verify`,
        {
          token,
          ip,
          userAgent,
        }
      );
      result = data;
    }
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
