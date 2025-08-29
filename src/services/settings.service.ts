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

    if (user.password != oldPassword) {
      return {
        error: "Incorrect password",
        status: 400,
      };
    }
    const isSame = await this.hasher.comparePassword(newPassword, oldPassword);

    if (isSame) {
      return {
        error: "you can not use same password as old password",
        status: 400,
      };
    }

    const hashedPassword = await this.hasher.Password(newPassword);

    await this.settingsRepo.setPassword(userId, hashedPassword);
    return {
      message: "password changed",
    };
  };
}
