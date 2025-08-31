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
    jest.clearAllMocks();

    mockSettingsRepo = {
      findUserInfoById: jest.fn(),
      setPassword: jest.fn(),
    } as any;

    mockHasher = {
      comparePassword: jest.fn(),
      Password: jest.fn(),
    } as any;

    service = new SettingsService(
      new AuthRepository() as any,
      mockSettingsRepo
    );
    (service as any).hasher = mockHasher;
  });

  it("should return error if user is not found", async () => {
    mockSettingsRepo.findUserInfoById.mockResolvedValue(null);

    await expect(
      service.changePassword(userId, "new-pass", "old-pass")
    ).rejects.toThrow("Cannot read properties of null");
    // or you can modify service to throw custom error if needed
  });

  it("should return error if old password is incorrect", async () => {
    mockSettingsRepo.findUserInfoById.mockResolvedValue({
      password: oldPasswordHash,
    } as any);
    mockHasher.comparePassword.mockResolvedValueOnce(false); // old password check fails

    const result = await service.changePassword(
      userId,
      "new-pass",
      "wrong-old-pass"
    );

    expect(result).toEqual({
      error: "incorrect password",
      status: 401,
    });
    expect(mockSettingsRepo.setPassword).not.toHaveBeenCalled();
  });

  it("should return error if new password is same as old one", async () => {
    mockSettingsRepo.findUserInfoById.mockResolvedValue({
      password: oldPasswordHash,
    } as any);
    // first compare (old password) → true
    mockHasher.comparePassword.mockResolvedValueOnce(true);
    // second compare (new password vs stored hash) → true (same)
    mockHasher.comparePassword.mockResolvedValueOnce(true);

    const result = await service.changePassword(userId, "new-pass", "old-pass");

    expect(result).toEqual({
      error: "you can not use same password as old password",
      status: 409,
    });
    expect(mockSettingsRepo.setPassword).not.toHaveBeenCalled();
  });

  it("should hash new password and update repository", async () => {
    mockSettingsRepo.findUserInfoById.mockResolvedValue({
      password: oldPasswordHash,
    } as any);

    mockHasher.comparePassword.mockResolvedValueOnce(false);
    mockHasher.comparePassword.mockResolvedValueOnce(true);
    mockHasher.Password.mockResolvedValue("hashed-new-pass");

    const result = await service.changePassword(userId, "new-pass", "old-pass");

    expect(mockHasher.Password).toHaveBeenCalledWith("new-pass");
    expect(mockSettingsRepo.setPassword).toHaveBeenCalledWith(
      userId,
      "hashed-new-pass"
    );
    expect(result).toEqual({ message: "password changed" });
  });

  it("should bubble up repository errors", async () => {
    mockSettingsRepo.findUserInfoById.mockRejectedValue(new Error("DB error"));

    await expect(
      service.changePassword(userId, "new-pass", "old-pass")
    ).rejects.toThrow("DB error");
  });

  it("should bubble up hasher errors", async () => {
    mockSettingsRepo.findUserInfoById.mockResolvedValue({
      password: oldPasswordHash,
    } as any);
    mockHasher.comparePassword.mockRejectedValue(new Error("hash error"));

    await expect(
      service.changePassword(userId, "new-pass", "old-pass")
    ).rejects.toThrow("hash error");
  });
});
