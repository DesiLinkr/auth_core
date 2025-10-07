import { AuthRepository } from "../repositories/auth.repository";
import { Hasher } from "../utils/hash.util";
import { sendVerificationEmail } from "../utils/grpc.util";
import { EmailVerificationTokenCache } from "../cache/emailVerification.cache";
import { VerificationEmailRequest } from "../grpc/generated/email";

export class AuthService {
  private readonly AuthRepo: AuthRepository;
  private readonly Hasher: Hasher;
  private cache;
  constructor(authRepo?: AuthRepository, cache?: EmailVerificationTokenCache) {
    this.cache = cache ?? new EmailVerificationTokenCache();

    this.AuthRepo = authRepo ?? new AuthRepository();
    this.Hasher = new Hasher();
  }

  public register = async (
    name: string,
    email: string,
    rawPassword: string
  ) => {
    try {
      const existing: any = await this.AuthRepo.findByEmail(email);

      if (existing) {
        const isVerified = existing.isVerified;

        if (!isVerified) {
          return {
            error: "User already exists but not verified",
            status: 409,
          };
        }
        return { error: "User already exists", status: 409 };
      }
      const hashPassword = await this.Hasher.Password(rawPassword);
      const userData = await this.AuthRepo.createUser(
        email,
        name,
        hashPassword
      );
      if (!userData) {
        return { error: "User registration failed", status: 422 };
      }
      const token = await this.Hasher.generateToken();
      const expirytime = 600;
      await this.cache.createToken(userData.id, token, expirytime);

      const req: VerificationEmailRequest = {
        to: email,
        data: {
          name,
          expiry: Math.floor(expirytime / 60),
          verifyUrl: `${process.env.url}:${process.env.PORT}/${token}`,
          year: `${new Date().getFullYear()}`,
        },
        retry: 0,
      };
      await sendVerificationEmail(req);
      const { password, ...safeUser } = userData;

      return safeUser;
    } catch (error: any) {
      console.log(error);

      throw new Error(error.message || "Internal server error");
    }
  };
}
