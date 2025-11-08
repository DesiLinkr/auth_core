import { Request, Response } from "express";
import { SettingsService } from "../services/settings.service";
import { error } from "console";

export class SettingsController {
  private SettingsService: SettingsService;

  constructor() {
    this.SettingsService = new SettingsService();
  }
  public addNewEmail = async (req: Request, res: Response) => {
    try {
      const result: any = await this.SettingsService.addEmail(
        (req as any).userId,
        req.body.email
      );
      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
      }
      res.status(200).json(result);
    } catch (error: any) {
      console.log(error);

      res.status(500).json(error.message);
    }
  };
  public changepassword = async (req: Request, res: Response) => {
    try {
      const result: any = await this.SettingsService.changePassword(
        (req as any).userId,
        req.body.newPassword,
        req.body.oldPassword
      );
      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
      }
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json(error.message);
    }
  };
}
