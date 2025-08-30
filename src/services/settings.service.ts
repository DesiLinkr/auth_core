import { AuthRepository } from "../repositories/auth.repository";
import { settingsRepository } from "../repositories/settings.repository";
import { Hasher } from "../utils/hash.util";

export class SettingsService {
  private readonly hasher: Hasher;
  private readonly authRepo: AuthRepository;
  private readonly settingsRepo: settingsRepository;

  constructor(AuthRepo?: AuthRepository, settingsRepo?: settingsRepository) {
    this.hasher = new Hasher();
    this.authRepo = AuthRepo ?? new AuthRepository();
    this.settingsRepo = settingsRepo ?? new settingsRepository();
  }

  public changePassword = async (
    userId: string,
    newPassword: string,
    oldPassword: string
  ) => {
    const user: any = await this.settingsRepo.findUserInfoById(userId);

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

    const hashedPassword = await this.hasher.Password(newPassword);

    await this.settingsRepo.setPassword(userId, hashedPassword);
    return {
      message: "password changed",
    };
  };
}
