import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

class AuthController {
  private AuthService;

  constructor(authService?: AuthService) {
    this.AuthService = authService ?? new AuthService();
  }
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, password } = req.body;

      const userData = await this.AuthService.register(name, email, password);
      if (!userData) {
        res.status(400).json({ message: "User registration failed" });
        return;
      }
      if ("error" in userData) {
        res.status(userData.status).json({ message: userData.error });
        return;
      }
      res.status(201).json(userData);
    } catch (error: any) {
      res.status(500).json(error.message);
    }
  };


  public forgotPassword = async (req : Request, res : Response) : Promise<void> => {
    try {
      const {email} = req.body;
      const result = await this.AuthService.forgetPassword(email);

      if("error" in result){
        res.status(result.status).json({
          success  :false,
          message : result.error,
          statusCode: result.status,
        });
        return;
      }

      res.status(result.status).json({
        success : true,
        message : result.message,
        statusCode : result.status,
      });
    }catch (error : any) {
      res.status(500).json({
        success  :false,
        message : error.message,
        statusCode : 500
      });
    }
  };


}

export default AuthController;
