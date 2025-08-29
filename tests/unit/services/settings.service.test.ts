import { SettingsService } from "../../../src/services/settings.service";
import { AuthRepository } from "../../../src/repositories/auth.repository";
import { settingsRepository } from "../../../src/repositories/settings.repository";
import { Hasher } from "../../../src/utils/hash.util";

jest.mock("../../../src/repositories/auth.repository");
jest.mock("../../../src/repositories/settings.repository");
jest.mock("../../../src/utils/hash.util");

describe("SettingsService.changePassword", () => {
  let service: SettingsService;
  let mockSettingsRepo: jest.Mocked<settingsRepository>;
  let mockHasher: jest.Mocked<Hasher>;

  const userId = "user-123";
  const oldPasswordHash = "old-password-hash";

  beforeEach(() => {
    // mock repositories + utils
    mockSettingsRepo = {
      findUserInfoById: jest.fn(),
      setPassword: jest.fn(),
    } as any;

    mockHasher = {
      comparePassword: jest.fn(),
      Password: jest.fn(),
    } as any;

    // Inject mocks into service
    service = new SettingsService(
      new AuthRepository() as any,
      mockSettingsRepo
    );

    // Override hasher instance inside service
    (service as any).hasher = mockHasher;
  });

  it("should return error if new password is same as old one", async () => {
    mockSettingsRepo.findUserInfoById.mockResolvedValue({
      password: oldPasswordHash,
    } as any);
    mockHasher.comparePassword.mockReturnValue(true as any); // same password

    const result = await service.changePassword(userId, "new-password");

    expect(result).toEqual({
      error: "you can not use same password as old password",
      status: 400,
    });
    expect(mockSettingsRepo.setPassword).not.toHaveBeenCalled();
  });

  it("should hash new password and update repository", async () => {
    mockSettingsRepo.findUserInfoById.mockResolvedValue({
      password: oldPasswordHash,
    } as any);
    mockHasher.comparePassword.mockReturnValue(false as any); // different password
    mockHasher.Password.mockResolvedValue("hashed-new-password");

    const result = await service.changePassword(userId, "new-password");

    expect(mockHasher.Password).toHaveBeenCalledWith("new-password");
    expect(mockSettingsRepo.setPassword).toHaveBeenCalledWith(
      userId,
      "hashed-new-password"
    );
    expect(result).toEqual({ message: "password changed" });
  });
});
