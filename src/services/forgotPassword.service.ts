import { ForgotPasswordTokenCache } from "../cache/forgotPassword.cache";
import { ForgotPasswordRequest } from "../grpc/generated/email";
import { AuthRepository } from "../repositories/auth.repository";
import { sendforgotPassword } from "../utils/grpc.util";
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
    const token = await this.Hasher.generateToken();
    const userData: any = await this.AuthRepo.findByEmail(email);
    console.log(userData);

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
    const expirytime = 900;

    await this.cache.createToken(userData.user.id, token, expirytime);

    const req: ForgotPasswordRequest = {
      to: email,
      data: {
        name: userData.user.name,
        resetLink: `http://localhost:${process.env.PORT}/${token}`,
        year: `${new Date().getFullYear()}`,
        expiry: Math.floor(expirytime / 60),
      },
      retry: 0,
    };

    await sendforgotPassword(req);
    return {
      message:
        "If this email exists, password reset instructions have been sent.",
    };
  };
}
