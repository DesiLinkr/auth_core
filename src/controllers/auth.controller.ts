import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

class AuthController {
  private AuthService;

  constructor(authService?: AuthService) {
    this.AuthService = authService ?? new AuthService();
  }
  public register = async (req: Request, res: Response) => {
    try {
      const { email, name, password } = req.body;
      const userData = await this.AuthService.register(email, name, password);

      if (!userData) {
        return res.status(400).json({ message: "User registration failed" });
      }
      return res.status(201).json(userData);
    } catch (error: any) {
      res.status(500).json(error.message);
    }
  };
}

export default AuthController;
