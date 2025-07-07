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

describe("", () => {
  const mockAuthRepo = {
    findByEmail: jest.fn(),
  };

  const mockCache = {
    createToken: jest.fn(),
  };
  const service = new ForgotPasswordService(
    mockAuthRepo as unknown as AuthRepository,
    mockCache as unknown as ForgotPasswordTokenCache
  );

  const mockHasher = {
    generateToken: jest.fn().mockResolvedValue("mock-token"),
  };
  (service as any).Hasher = mockHasher as unknown as Hasher;
  it("Should generate a token and store it in Redis for valid verified & primary user", async () => {
    const mockUserData = {
      id: "user1",
      name: "Harsh",
      profileImage: "img.png",
      plan: PlanType.FREE, //  // assuming this is your enum value
      createdAt: new Date(),
      updatedAt: new Date(),
      emails: [
        {
          id: "email1",
          email: "harsh@example.com",
          isPrimary: true,
          isVerified: true,
          userId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    mockAuthRepo.findByEmail.mockResolvedValue(mockUserData);

    const res = await service.requestPasswordReset("harsh@example.com");
    expect(res).toEqual({
      error: "Email is not verified or not primary",
      status: 409,
    });
  });
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
      id: "user1",
      name: "Harsh",
      profileImage: "img.png",
      plan: PlanType.FREE, //  // assuming this is your enum value
      createdAt: new Date(),
      updatedAt: new Date(),
      emails: [
        {
          id: "email1",
          email: "harsh@example.com",
          isPrimary: true,
          isVerified: false,
          userId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    mockAuthRepo.findByEmail.mockResolvedValue(mockUserData);

    const res = await service.requestPasswordReset("user@example.com");

    expect(res).toEqual({
      error: "Email is not verified or not primary",
      status: 409,
    });
    expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("user@example.com");
  });

  it("Should return 409 if the email is not marked as primary", async () => {
    const mockUserData = {
      id: "user1",
      name: "Harsh",
      profileImage: "img.png",
      plan: PlanType.FREE, //  // assuming this is your enum value
      createdAt: new Date(),
      updatedAt: new Date(),
      emails: [
        {
          id: "email1",
          email: "harsh@example.com",
          isPrimary: false,
          isVerified: true,
          userId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    mockAuthRepo.findByEmail.mockResolvedValue(mockUserData);

    const res = await service.requestPasswordReset("user@example.com");

    expect(res).toEqual({
      error: "Email is not verified or not primary",
      status: 409,
    });
    expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("user@example.com");
  });
});
