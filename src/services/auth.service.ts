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
import { OAuth2Client } from "google-auth-library";
import { SecureTokenCache } from "../cache/secure.cache";
import { delsessionsRequest } from "../grpc/generated/access";
import axios from "axios";
import { string } from "joi";

export class AuthService {
  private readonly authRepo: AuthRepository;
  private readonly hasher: Hasher;
  private readonly securecache: SecureTokenCache;
  private Verificationcache;
  private client;
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
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  public linkedinSignIn = async (
    code: string,
    ip: string,
    userAgent: string
  ) => {
    if (!code) {
      return { error: "code is required", status: 400 };
    }
    let oldUser = true;
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;
    const userInfoRes = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = userInfoRes.data;
    const email = data.email;
    const name = data.name;
    const avatar_url = data.picture;
    if (!email) {
      return { error: "LinkedIn email not available", status: 400 };
    }
    let userRecord: any = await this.authRepo.findByEmail(email);
    if (userRecord && !userRecord.isVerified) {
      return { error: "email not verified", status: 409 };
    }
    if (!userRecord) {
      oldUser = false;

      userRecord = await this.authRepo.createUser(
        email,
        name,
        null,
        true,
        avatar_url
      );
    }

    const userId = userRecord.user?.id || userRecord.id;
    const userName = userRecord.user?.name || userRecord.name;
    const userEmail = userRecord.email;
    const session = await createSession({ ip, userId, userAgent });
    const secureToken = await this.hasher.generateToken();
    await this.securecache.createToken(userId, secureToken, 600);
    if (oldUser) {
      await sendAcesssEmail({
        name: userName,
        to: userEmail,
        secureAccountUrl: `${process.env.url}:${process.env.PORT}/${secureToken}`,
        ipAddress: ip,
      });
    }
    return session;
  };

  public githubSignIn = async (code: string, ip: string, userAgent: string) => {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      { headers: { Accept: "application/json" } }
    );

    let oldUser = true;
    const accessToken = tokenRes.data.access_token;

    const ghUser = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { data } = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const email = data.find((e: any) => e.primary)?.email;

    if (!email) {
      return { error: "GitHub email not available", status: 400 };
    }

    let userRecord: any = await this.authRepo.findByEmail(email);
    console.log(userRecord);

    if (userRecord && !userRecord.isVerified) {
      return { error: "email not verified", status: 409 };
    }

    if (!userRecord) {
      oldUser = false;

      userRecord = await this.authRepo.createUser(
        email,
        ghUser.data.name || "GitHub User",
        null,
        true,
        ghUser.data.avatar_url || null
      );
    }

    const userId = userRecord.user?.id || userRecord.id;
    const userName = userRecord.user?.name || userRecord.name;
    const userEmail = userRecord.email;

    const session = await createSession({ ip, userId, userAgent });

    const secureToken = await this.hasher.generateToken();
    await this.securecache.createToken(userId, secureToken, 600);
    if (oldUser) {
      await sendAcesssEmail({
        name: userName,
        to: userEmail,
        secureAccountUrl: `${process.env.url}:${process.env.PORT}/${secureToken}`,
        ipAddress: ip,
      });
    }
    return session;
  };
  public googleSignIn = async (
    credential: string,
    ip: string,
    userAgent: string
  ) => {
    let oldUser = true;
    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID2,
    });
    const payload: any = ticket.getPayload();

    let userRecord: any = await this.authRepo.findByEmail(payload.email);

    if (userRecord && !userRecord.isVerified) {
      return {
        error: "email not verified",
        status: 409,
      };
    }

    if (!userRecord) {
      if (!payload?.email_verified) {
        return {
          error: "Google email not verified",
          status: 409,
        };
      }
      oldUser = false;
      userRecord = await this.authRepo.createUser(
        payload.email,
        payload.name,
        null,
        true,
        payload.picture || null
      );
    }
    const userId = userRecord.user?.id || userRecord.id;
    const userName = userRecord.user?.name || userRecord.name;
    const userEmail = userRecord.email;

    const Sessiontoken = await createSession({
      ip,
      userId,
      userAgent,
    });
    const expirytime = 600;
    const token = await this.hasher.generateToken();
    await this.securecache.createToken(userId, token, expirytime);

    if (oldUser) {
      await sendAcesssEmail({
        name: userName,
        to: userEmail,
        secureAccountUrl: `${process.env.url}:${process.env.PORT}/${token}`,
        ipAddress: ip,
      });
    }

    return Sessiontoken;
  };
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

    sendVerificationEmail({
      to: email,
      data: {
        name,
        expiry: Math.floor(expirytime / 60),
        verifyUrl: `${process.env.url}:${process.env.PORT}/${token}`,
        year: `${new Date().getFullYear()}`,
        context: "registration",
      },
      retry: 0,
    });

    return { message: "User registered sucessfully" };
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

    return Sessiontoken;
  };
}
