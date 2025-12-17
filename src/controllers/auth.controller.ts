import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { SecureTokenCache } from "../cache/secure.cache";
import { AuthRepository } from "../repositories/auth.repository";

class AuthController {
  private AuthService;
  public cache: SecureTokenCache;
  public authrepository: AuthRepository;
  constructor(authService?: AuthService, authrepository?: AuthRepository) {
    this.AuthService = authService ?? new AuthService();
    this.cache = new SecureTokenCache();
    this.authrepository = authrepository ?? new AuthRepository();
  }

  public userProfile = async (req: Request, res: Response) => {
    try {
      const data = await this.authrepository.findUserInfoById(
        (req as any).userId
      );
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
    }
  };
  public linkedinSignIn = async (req: Request, res: Response) => {
    try {
      const { ip, user_agent } = (req as any).clientInfo;
      const result: any = await this.AuthService.linkedinSignIn(
        req.body.code as string,
        ip,
        user_agent
      );

      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
      }
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true, // ❗ cannot be accessed by JS
        secure: false, // true in production (HTTPS)
        sameSite: "lax", // works for OAuth redirects
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);

      res.status(500).json("Internal server error");
    }
  };
  public githubSignIn = async (req: Request, res: Response) => {
    try {
      const { ip, user_agent } = (req as any).clientInfo;
      const result: any = await this.AuthService.githubSignIn(
        req.body.code as string,
        ip,
        user_agent
      );

      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
      }

      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true, // ❗ cannot be accessed by JS
        secure: false, // true in production (HTTPS)
        sameSite: "lax", // works for OAuth redirects
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);

      res.status(500).json("Internal server error");
    }
  };
  public googleSignIn = async (req: Request, res: Response) => {
    try {
      const { ip, user_agent } = (req as any).clientInfo;

      const result: any = await this.AuthService.googleSignIn(
        req.body.code,
        ip,
        user_agent
      );

      if ("error" in result) {
        console.log(result);

        res.status(result.status).json({ message: result.error });
      }
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true, // ❗ cannot be accessed by JS
        secure: false, // true in production (HTTPS)
        sameSite: "lax", // works for OAuth redirects
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ success: true });
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

      const userData: any = await this.AuthService.register(
        name,
        email,
        password
      );
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
      const result: any = await this.AuthService.login(
        email,
        password,
        ip,
        user_agent
      );
      if (!result) {
        res.status(400).json({ message: "User registration failed" });
        return;
      }
      if ("error" in result) {
        res.status(result.status).json({ message: result.error });
        return;
      }
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true, // ❗ cannot be accessed by JS
        secure: false, // true in production (HTTPS)
        sameSite: "lax", // works for OAuth redirects
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.log(error);

      res.status(500).json(error.message);
    }
  };
}

export default AuthController;
