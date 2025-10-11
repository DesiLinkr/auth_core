// ---------------------- MOCKS ----------------------
jest.mock("../../../src/redis/client", () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

// Mock gRPC utilities
jest.mock("../../../src/utils/grpc.util", () => ({
  sendforgotPassword: jest.fn(),
  sendAcesssEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
  createSession: jest.fn(),
}));

import { ForgotPasswordService } from "../../../src/services/forgotPassword.service";
import { ForgotPasswordTokenCache } from "../../../src/cache/forgotPassword.cache";
import { AuthRepository } from "../../../src/repositories/auth.repository";
import { Hasher } from "../../../src/utils/hash.util";

import * as grpcUtil from "../../../src/utils/grpc.util";
const mockedGrpc = grpcUtil as jest.Mocked<typeof grpcUtil>;
const { sendforgotPassword } = mockedGrpc;

// ---------------------- TEST SUITE ----------------------
describe("ForgotPassword controller", () => {
  const mockHasher = {
    generateToken: jest.fn(),
  };

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

  // Override private hasher with mock
  // @ts-ignore
  service.Hasher = mockHasher as unknown as Hasher;

  const email = "harsh@example.com";

  beforeEach(() => {
    jest.clearAllMocks();

    // Prevent real gRPC calls
    sendforgotPassword.mockResolvedValue({ msg: "ok" });
  });

  it("should return 400 if user not found", async () => {
    (mockAuthRepo.findByEmail as jest.Mock).mockResolvedValue(null);

    const result = await service.requestPasswordReset(email);

    expect(result).toEqual({
      error: "no User account found on this email",
      status: 404,
    });
  });

  it("should return 409 if user is not verified", async () => {
    (mockAuthRepo.findByEmail as jest.Mock).mockResolvedValue({
      emails: [{ isVerified: false, isPrimary: true }],
    });

    const result = await service.requestPasswordReset(email);

    expect(result).toEqual({
      error: "Email is not verified or not primary",
      status: 409,
    });
  });

  it("should return 409 if email is not primary", async () => {
    (mockAuthRepo.findByEmail as jest.Mock).mockResolvedValue({
      emails: [{ isVerified: true, isPrimary: false }],
    });

    const result = await service.requestPasswordReset(email);

    expect(result).toEqual({
      error: "Email is not verified or not primary",
      status: 409,
    });
  });

  it("should return success and call createToken when user is valid", async () => {
    (mockHasher.generateToken as jest.Mock).mockResolvedValue("abc123");
    (mockAuthRepo.findByEmail as jest.Mock).mockResolvedValue({
      id: "email1",
      email: "harsh@example.com",
      isPrimary: true,
      isVerified: true,
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { name: "Harsh", id: "user1" },
    });

    const result = await service.requestPasswordReset(email);

    expect(mockCache.createToken).toHaveBeenCalledWith("user1", "abc123", 900);
    expect(result).toEqual({
      message:
        "If this email exists, password reset instructions have been sent.",
    });
  });
});
