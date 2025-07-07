import { Request, Response } from "express";
import { ForgotPasswordService } from "../services/forgotPassword.service";

class ForgotPasswordController {
  private forgotPasswordService: ForgotPasswordService;

  constructor() {
    this.forgotPasswordService = new ForgotPasswordService();
  }

  public sendPasswordResetToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.forgotPasswordService.requestPasswordReset(email);

      
      res.status(result.status || 200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
        status: 500,
      });
    }
  };
}

export default ForgotPasswordController;
