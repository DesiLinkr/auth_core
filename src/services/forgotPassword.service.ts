import { ForgotPasswordTokenCache } from "../cache/forgotPassword.cache";
import { AuthRepository } from "../repositories/auth.repository";
import { Hasher } from "../utils/hash.util";

export class ForgotPasswordService {
  private readonly Hasher: Hasher;
  private readonly AuthRepo: AuthRepository;
  private readonly cache: ForgotPasswordTokenCache;
  constructor(AuthRepo?: AuthRepository, cache?: ForgotPasswordTokenCache) {
    this.Hasher = new Hasher();
    this.AuthRepo = AuthRepo ?? new AuthRepository();
    this.cache = cache ?? new ForgotPasswordTokenCache();
  }
  requestPasswordReset = async (email: string) => {
    try {
      const token = await this.Hasher.generateToken();
      const userData: any = await this.AuthRepo.findByEmail(email);

      if (!userData) {
        return {
          error: "no User account found on this email",
          status: 404,
        };
      }
      if (!userData.isVerified || !userData.isPrimary) {
        return {
          error: "Email is not verified or not primary",
          status: 409,
        };
      }

      await this.cache.createToken(userData.user.id, token);

      return {
        message:
          "If this email exists, password reset instructions have been sent.",
      };
      // add email logic here in future
    } catch (error: any) {
      throw new Error(error.message || "Internal server error");
    }
  };
}
