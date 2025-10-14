import { Request, Response } from "express";
import { ForgotPasswordService } from "../services/forgotPassword.service";
import { ForgotPasswordTokenCache } from "../cache/forgotPassword.cache";
import { valid } from "joi";

class ForgotPasswordController {
  private forgotPasswordService: ForgotPasswordService;
  private readonly cache: ForgotPasswordTokenCache;

  constructor() {
    this.forgotPasswordService = new ForgotPasswordService();
    this.cache = new ForgotPasswordTokenCache();
  }

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      const result: any = await this.forgotPasswordService.resetPassword(
        token,
        password
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
  public verifyResetToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const isvaildToken = await this.cache.isvaildToken(token);

      if (isvaildToken) {
        res.status(200).json({
          success: isvaildToken,
        });
      } else {
        res.status(400).json({ message: "invaild Token" });
      }
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };

  public sendPasswordResetToken = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;
      const result: any = await this.forgotPasswordService.requestPasswordReset(
        email
      );

      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      console.log(error);

      res.status(500).json("Internal server error");
    }
  };
}

export default ForgotPasswordController;
