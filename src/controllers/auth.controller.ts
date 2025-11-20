import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { SecureTokenCache } from "../cache/secure.cache";

class AuthController {
  private AuthService;
  public cache: SecureTokenCache;
  constructor(authService?: AuthService) {
    this.AuthService = authService ?? new AuthService();
    this.cache = new SecureTokenCache();
  }
  public githubSignIn = async (req: Request, res: Response) => {
    try {
      const { ip, user_agent } = (req as any).clientInfo;
      const result: any = await this.AuthService.githubSignIn(
        req.query.code as string,
        ip,
        user_agent
      );

      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
      }
      res.status(200).json(result);
    } catch (error) {
      console.log(error);

      res.status(500).json("Internal server error");
    }
  };
  public googleSignIn = async (req: Request, res: Response) => {
    try {
      const { ip, user_agent } = (req as any).clientInfo;

      const result: any = await this.AuthService.googleSignIn(
        req.body.credential,
        ip,
        user_agent
      );

      if ("error" in result) {
        console.log(result);

        res.status(result.status).json({ message: result.error });
      }
      res.status(200).json(result);
    } catch (error) {
      console.log(error);

      res.status(500).json("Internal server error");
    }
  };
  public secureAccount = async (req: Request, res: Response) => {
    try {
      const { token, oldPassword, newPassword } = req.body;
      const result: any = await this.AuthService.secure(
        token,
        oldPassword,
        newPassword
      );

      if ("error" in result) {
        console.log(result);

        res.status(result.status).json({ message: result.error });
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
  public secureVerifyToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const isvaildToken = await this.cache.isvaildToken(token);

      if (!isvaildToken) {
        res.status(400).json({ message: "invaild Token" });
      }
      res.status(200).json({
        success: isvaildToken,
      });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
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
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { ip, user_agent } = (req as any).clientInfo;
      const userData = await this.AuthService.login(
        email,
        password,
        ip,
        user_agent
      );
      if (!userData) {
        res.status(400).json({ message: "User registration failed" });
        return;
      }
      if ("error" in userData) {
        res.status(userData.status).json({ message: userData.error });
        return;
      }
      res.status(200).json(userData);
    } catch (error: any) {
      console.log(error);

      res.status(500).json(error.message);
    }
  };
}

export default AuthController;
