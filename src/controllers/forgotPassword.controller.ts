import { Request, Response } from "express";
import { ForgotPasswordService } from "../services/forgotPassword.service";

class ForgotPasswordController {
  private forgotPasswordService: ForgotPasswordService;

  constructor() {
    this.forgotPasswordService = new ForgotPasswordService();
  }

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
