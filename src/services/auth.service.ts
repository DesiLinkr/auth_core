import { AuthRepository } from "../repositories/auth.repository";
import { Hasher } from "../utils/hash.util";
import {
  createSession,
  sendAcesssEmail,
  sendVerificationEmail,
} from "../utils/grpc.util";
import { EmailVerificationTokenCache } from "../cache/emailVerification.cache";
import {
  AccessEmailRequest,
  VerificationEmailRequest,
} from "../grpc/generated/email";

import { SecureTokenCache } from "../cache/secure.cache";

export class AuthService {
  private readonly AuthRepo: AuthRepository;
  private readonly Hasher: Hasher;
  private readonly securecache: SecureTokenCache;
  private Verificationcache;
  constructor(
    secureTokenCache?: SecureTokenCache,
    authRepo?: AuthRepository,
    Verificationcache?: EmailVerificationTokenCache
  ) {
    this.Verificationcache =
      Verificationcache ?? new EmailVerificationTokenCache();
    this.securecache = secureTokenCache ?? new SecureTokenCache();
    this.AuthRepo = authRepo ?? new AuthRepository();
    this.Hasher = new Hasher();
  }

  public register = async (
    name: string,
    email: string,
    rawPassword: string
  ) => {
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
    const userData = await this.AuthRepo.createUser(email, name, hashPassword);
    if (!userData) {
      return { error: "User registration failed", status: 422 };
    }
    const token = await this.Hasher.generateToken();
    const expirytime = 600;
    await this.Verificationcache.createToken(userData.id, token, expirytime);

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
  };

  public login = async (
    email: string,
    password: string,
    ip: string,
    userAgent: string
  ) => {
    const existing: any = await this.AuthRepo.findByEmail(email);

    if (!existing || !existing.isPrimary) {
      return { error: "Invalid credentials", status: 402 };
    }
    const isVerified = existing.isVerified;

    if (!isVerified) {
      return {
        error: "User already exists but not verified",
        status: 409,
      };
    }

    const isSame = await this.Hasher.comparePassword(
      password,
      existing.user.password
    );

    if (!isSame) {
      return { error: "Invalid credentials", status: 401 };
    }

    const Sessiontoken = await createSession({
      ip,
      userId: existing.user.id,
      userAgent,
    });
    const expirytime = 600;

    const token = await this.Hasher.generateToken();
    await this.securecache.createToken(existing.user.id, token, expirytime);

    await sendAcesssEmail({
      name: existing.user.name,
      to: existing.email,
      secureAccountUrl: `${process.env.url}:${process.env.PORT}/${token}`,
      ipAddress: ip,
    });
    return Sessiontoken;
  };
}
