import { Request, Response } from "express";
import { ForgotPasswordService } from "../services/forgotPassword.service";

class ForgotPasswordController {
  private forgotPasswordService: ForgotPasswordService;

  constructor() {
    this.forgotPasswordService = new ForgotPasswordService();
  }

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const result = await this.forgotPasswordService.requestPasswordReset(email);

      if ("error" in result) {
        const statusCode = result.status ?? 400;
        res.status(statusCode).json({
          success: false,
          message: result.error,
          statusCode: result.status,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        statusCode: 200,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
        statusCode: 500,
      });
    }
  };
}

export default ForgotPasswordController;
