import { AuthRepository } from "../repositories/auth.repository";
import { settingsRepository } from "../repositories/settings.repository";
import { Hasher } from "../utils/hash.util";
import { sendVerificationEmail } from "../utils/grpc.util";
import { EmailVerificationTokenCache } from "../cache/emailVerification.cache";
export class SettingsService {
  private readonly hasher: Hasher;
  private readonly authRepo: AuthRepository;
  private readonly settingsRepo: settingsRepository;
  private readonly Verificationcache: EmailVerificationTokenCache;
  constructor(
    AuthRepo?: AuthRepository,
    settingsRepo?: settingsRepository,
    Verificationcache?: EmailVerificationTokenCache,
    hasher?: Hasher
  ) {
    this.Verificationcache =
      Verificationcache ?? new EmailVerificationTokenCache();
    this.hasher = hasher ?? new Hasher();
    this.authRepo = AuthRepo ?? new AuthRepository();
    this.settingsRepo = settingsRepo ?? new settingsRepository();
  }
  public changePrimaryEmail = async (userId: string, email: string) => {
    const Emailexits: any =
      await this.settingsRepo.checkEmailAssociatedWithUserId(email, userId);
    console.log(Emailexits, email, userId);

    if (!Emailexits) {
      return {
        error: "email does not exits",
        status: 403,
      };
    } else if (Emailexits.isPrimary) {
      return {
        error: "this email is allready Primary",
        status: 403,
      };
    }
    await this.settingsRepo.changePrimaryEmail(userId, email);
    return {
      message: "successful isPrimary email",
    };
  };
  public removeEmail = async (userId: string, email: string) => {
    const Emailexits: any =
      await this.settingsRepo.checkEmailAssociatedWithUserId(email, userId);
    console.log(Emailexits);

    if (!Emailexits) {
      return {
        error: "email does not exits",
        status: 403,
      };
    } else if (Emailexits.isPrimary) {
      return {
        error: "you can not remove primary email",
        status: 409,
      };
    }
    await this.settingsRepo.removeEmail(email);

    return {
      message: "email removed successful",
    };
  };

  public addEmail = async (userId: string, email: string) => {
    const Emailexits: any = await this.settingsRepo.checkEmailexits(email);
    if (!Emailexits) {
      await this.settingsRepo.addEmailtoUser(userId, email);
      const user: any = await this.authRepo.findUserInfoById(userId);
      const token = await this.hasher.generateToken();
      const expirytime = 600;
      await this.Verificationcache.createToken(userId, token, expirytime);

      await sendVerificationEmail({
        to: email,
        data: {
          name: user?.name,
          expiry: Math.floor(expirytime / 60),
          verifyUrl: `${process.env.url}:${process.env.PORT}/${token}`,
          year: `${new Date().getFullYear()}`,
          context: "secondary",
        },
        retry: 0,
      });
      return {
        message: "email addded and verification email sent successfully  ",
      };
    } else if (Emailexits.id !== userId) {
      return {
        error: "email is already exists with other user",
        status: 409,
      };
    } else {
      return {
        error: "email already exists",
        status: 409,
      };
    }
  };

  public changePassword = async (
    userId: string,
    newPassword: string,
    oldPassword: string
  ) => {
    const user: any = await this.settingsRepo.findUserInfoById(userId);
    const isSame = await this.hasher.comparePassword(
      newPassword,
      user.password
    );

    if (isSame) {
      return {
        error: "you can not use same password as old password",
        status: 409,
      };
    }
    const isSameasOldpassword = await this.hasher.comparePassword(
      oldPassword,
      user.password
    );

    if (!isSameasOldpassword) {
      return {
        error: "incorrect password",
        status: 401,
      };
    }

    const hashedPassword = await this.hasher.Password(newPassword);

    await this.settingsRepo.setPassword(userId, hashedPassword);

    return {
      message: "password changed",
    };
  };
}
