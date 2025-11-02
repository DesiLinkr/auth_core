jest.mock("../../../src/redis/client", () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

import { PlanType } from "@prisma/client";
import { ForgotPasswordTokenCache } from "../../../src/cache/forgotPassword.cache";
import { AuthRepository } from "../../../src/repositories/auth.repository";
import { ForgotPasswordService } from "../../../src/services/forgotPassword.service";
import { Hasher } from "../../../src/utils/hash.util";

describe("ForgotPasswordService Unit Tests", () => {
  const mockCache = {
    createToken: jest.fn(),
    getUserIdfromToken: jest.fn(),
    deleteToken: jest.fn(),
  };

  const mockAuthRepo = {
    findByEmail: jest.fn(),
    setPassword: jest.fn(),
  };

  const mockHasher = {
    generateToken: jest.fn().mockResolvedValue("mock-token"),
    Password: jest.fn(),
  };

  const service = new ForgotPasswordService(
    mockAuthRepo as unknown as AuthRepository,
    mockCache as unknown as ForgotPasswordTokenCache
  );

  beforeAll(() => {
    (service as any).hasher = mockHasher as unknown as Hasher;
  });

  // -----------------------------
  // requestPasswordReset tests
  // -----------------------------

  it("Should return 404 if no user is found with the given email", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue(null);

    const res = await service.requestPasswordReset("user@example.com");

    expect(res).toEqual({
      error: "no User account found on this email",
      status: 404,
    });
    expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("user@example.com");
  });

  it("Should return 409 if the user is not verified", async () => {
    const mockUserData = {
      isVerified: false,
      isPrimary: true,
      user: { id: "user1", name: "Harsh" },
    };
    mockAuthRepo.findByEmail.mockResolvedValue(mockUserData);

    const res = await service.requestPasswordReset("user@example.com");
    expect(res).toEqual({
      error: "Email is not verified or not primary",
      status: 409,
    });
  });

  it("Should return 409 if the email is not marked as primary", async () => {
    const mockUserData = {
      isVerified: true,
      isPrimary: false,
      user: { id: "user1", name: "Harsh" },
    };
    mockAuthRepo.findByEmail.mockResolvedValue(mockUserData);

    const res = await service.requestPasswordReset("user@example.com");
    expect(res).toEqual({
      error: "Email is not verified or not primary",
      status: 409,
    });
  });

  // -----------------------------
  // resetPassword tests
  // -----------------------------

  it("should reset password successfully when token is valid", async () => {
    mockCache.getUserIdfromToken.mockResolvedValue("user1");
    mockHasher.Password.mockResolvedValue("hashedPassword");
    mockAuthRepo.setPassword.mockResolvedValue({});

    const result = await service.resetPassword("validToken", "newPass123");

    expect(mockCache.getUserIdfromToken).toHaveBeenCalledWith("validToken");
    expect(mockHasher.Password).toHaveBeenCalledWith("newPass123");
    expect(mockAuthRepo.setPassword).toHaveBeenCalledWith(
      "user1",
      "hashedPassword"
    );
    expect(mockCache.deleteToken).toHaveBeenCalledWith("validToken");
    expect(result).toEqual({ message: "password changed" });
  });

  it("should return error if token is invalid", async () => {
    mockCache.getUserIdfromToken.mockResolvedValue(null);

    const result = await service.resetPassword("invalidToken", "newPass123");

    expect(result).toEqual({ error: "invaild Token", status: 400 });
  });

  it("should throw if hasher fails", async () => {
    mockCache.getUserIdfromToken.mockResolvedValue("user1");
    mockHasher.Password.mockRejectedValue(new Error("Hash failed"));

    await expect(
      service.resetPassword("validToken", "newPass123")
    ).rejects.toThrow("Hash failed");
  });

  it("should throw if AuthRepo.setPassword fails", async () => {
    mockCache.getUserIdfromToken.mockResolvedValue("user1");
    mockHasher.Password.mockResolvedValue("hashedPassword");
    mockAuthRepo.setPassword.mockRejectedValue(new Error("DB error"));

    await expect(
      service.resetPassword("validToken", "newPass123")
    ).rejects.toThrow("DB error");
  });
});
