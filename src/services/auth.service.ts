import { AuthRepository } from "../repositories/auth.repository";
import { Hasher } from "../utils/hash.util";
import {
  createSession,
  delAllsessions,
  sendAcesssEmail,
  sendVerificationEmail,
} from "../utils/grpc.util";
import { EmailVerificationTokenCache } from "../cache/emailVerification.cache";
import {
  AccessEmailRequest,
  VerificationEmailRequest,
} from "../grpc/generated/email";

import { SecureTokenCache } from "../cache/secure.cache";
import { delsessionsRequest } from "../grpc/generated/access";

export class AuthService {
  private readonly authRepo: AuthRepository;
  private readonly hasher: Hasher;
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
    this.authRepo = authRepo ?? new AuthRepository();
    this.hasher = new Hasher();
  }
  public secure = async (
    token: string,
    oldPassword: string,
    newPassword: string
  ) => {
    const userId = await this.securecache.getUserIdfromToken(token);
    if (!userId) {
      return {
        error: "invaild Token",
        status: 400,
      };
    }

    const { password: currentPassword }: any =
      await this.authRepo.findUserInfoById(userId, true);

    const isSame = await this.hasher.comparePassword(
      oldPassword,
      currentPassword
    );

    if (!isSame) {
      return {
        error: "old password is incorrect",
        status: 402,
      };
    }

    if (newPassword == oldPassword) {
      return {
        error: "you can not use same password as old password",
        status: 409,
      };
    }
    const hashedPassword = await this.hasher.Password(newPassword);

    await this.authRepo.setPassword(userId, hashedPassword);
    await delAllsessions({
      userId,
    });
    await this.securecache.deleteToken(token);

    return {
      message: "password changed && logout form all devices successfully ",
    };
  };
  public register = async (
    name: string,
    email: string,
    rawPassword: string
  ) => {
    const existing: any = await this.authRepo.findByEmail(email);

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
    const hashPassword = await this.hasher.Password(rawPassword);
    const userData = await this.authRepo.createUser(email, name, hashPassword);
    if (!userData) {
      return { error: "User registration failed", status: 422 };
    }
    const token = await this.hasher.generateToken();
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

    const { password, ...safeUser } = userData;

    return safeUser;
  };

  public login = async (
    email: string,
    password: string,
    ip: string,
    userAgent: string
  ) => {
    const existing: any = await this.authRepo.findByEmail(email);

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

    const isSame = await this.hasher.comparePassword(
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

    const token = await this.hasher.generateToken();
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
