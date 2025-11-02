import { PlanType } from "@prisma/client";
import { AuthService } from "../../../src/services/auth.service";

// ✅ Mock gRPC utilities
jest.mock("../../../src/utils/grpc.util", () => ({
  sendVerificationEmail: jest.fn(),
  sendAcesssEmail: jest.fn(),
  createSession: jest.fn(),
  delAllsessions: jest.fn(),
}));

import {
  sendVerificationEmail,
  sendAcesssEmail,
  createSession,
  delAllsessions,
} from "../../../src/utils/grpc.util";

describe("AuthService", () => {
  // ✅ Mocks
  const mockAuthRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findUserInfoById: jest.fn(),
    setPassword: jest.fn(), // crucial for secure() tests
  };

  const mockHasher = {
    Password: jest.fn(),
    generateToken: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockVerificationCache = {
    createToken: jest.fn(),
  };

  const mockSecureCache = {
    createToken: jest.fn(),
    deleteToken: jest.fn(),
    getUserIdfromToken: jest.fn(),
  };

  // ✅ Inject mocks into service
  const authService = new AuthService(
    mockSecureCache as any,
    mockAuthRepo as any,
    mockVerificationCache as any
  );

  const email = "test@example.com";
  const password = "secret123";
  const name = "Test User";
  const ip = "192.168.1.10";
  const userAgent = "Mozilla/5.0";

  beforeEach(() => {
    jest.clearAllMocks();
    (authService as any).hasher = mockHasher;
    (authService as any).AuthRepo = mockAuthRepo; // ✅ Ensure test always uses mocks
  });

  // ----------------------------------------------------
  // REGISTER TESTS
  // ----------------------------------------------------
  describe("register()", () => {
    it("should register a new user when email is not taken", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockHasher.Password.mockResolvedValue("hashedPwd");
      mockHasher.generateToken.mockResolvedValue("token123");
      mockVerificationCache.createToken.mockResolvedValue(true);
      (sendVerificationEmail as jest.Mock).mockResolvedValue({ msg: "ok" });

      const mockUserData = {
        id: "user1",
        name: "Harsh",
        password: "secret",
        profileImage: "img.png",
        plan: PlanType.FREE,
        createdAt: new Date(),
        updatedAt: new Date(),
        emails: [
          {
            id: "email1",
            email,
            isPrimary: true,
            isVerified: true,
            userId: "user1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      mockAuthRepo.createUser.mockResolvedValue(mockUserData);

      const result = await authService.register(name, email, password);

      expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(mockHasher.Password).toHaveBeenCalledWith(password);
      expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
        email,
        name,
        "hashedPwd"
      );
      expect(mockVerificationCache.createToken).toHaveBeenCalled();
      expect(sendVerificationEmail).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({ id: "user1", name: "Harsh" })
      );
    });

    it("should return error when email already exists and verified", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({ isVerified: true });
      const result = await authService.register(name, email, password);
      expect(result).toEqual({ error: "User already exists", status: 409 });
    });

    it("should return error when email exists but not verified", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({ isVerified: false });
      const result = await authService.register(name, email, password);
      expect(result).toEqual({
        error: "User already exists but not verified",
        status: 409,
      });
    });

    it("should return error if user creation fails", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockHasher.Password.mockResolvedValue("hashedPwd");
      mockAuthRepo.createUser.mockResolvedValue(null);

      const result = await authService.register(name, email, password);
      expect(result).toEqual({
        error: "User registration failed",
        status: 422,
      });
    });

    it("should throw an error if repository fails", async () => {
      mockAuthRepo.findByEmail.mockRejectedValue(new Error("DB crashed"));
      await expect(authService.register(name, email, password)).rejects.toThrow(
        "DB crashed"
      );
    });
  });

  // ----------------------------------------------------
  // LOGIN TESTS
  // ----------------------------------------------------
  describe("login()", () => {
    it("should return error if user not found", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      const result = await authService.login(email, password, ip, userAgent);
      expect(result).toEqual({ error: "Invalid credentials", status: 402 });
    });

    it("should return error if user is not primary", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({ isPrimary: false });
      const result = await authService.login(email, password, ip, userAgent);
      expect(result).toEqual({ error: "Invalid credentials", status: 402 });
    });

    it("should return error if email exists but not verified", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({
        isPrimary: true,
        isVerified: false,
      });
      const result = await authService.login(email, password, ip, userAgent);
      expect(result).toEqual({
        error: "User already exists but not verified",
        status: 409,
      });
    });

    it("should return error if password does not match", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({
        isPrimary: true,
        isVerified: true,
        user: { password: "hashed123" },
      });
      mockHasher.comparePassword.mockResolvedValue(false);

      const result = await authService.login(email, password, ip, userAgent);
      expect(result).toEqual({ error: "Invalid credentials", status: 401 });
    });

    it("should login successfully and send access email", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({
        isPrimary: true,
        isVerified: true,
        email,
        user: { id: "u1", name: "Harsh", password: "hashedPwd" },
      });
      mockHasher.comparePassword.mockResolvedValue(true);
      mockHasher.generateToken.mockResolvedValue("secureToken");
      (createSession as jest.Mock).mockResolvedValue({ sessionId: "s1" });
      mockSecureCache.createToken.mockResolvedValue(true);
      (sendAcesssEmail as jest.Mock).mockResolvedValue({ msg: "sent" });

      const result = await authService.login(email, password, ip, userAgent);
      expect(result).toEqual({ sessionId: "s1" });
      expect(sendAcesssEmail).toHaveBeenCalled();
    });

    it("should throw if repo fails during login", async () => {
      mockAuthRepo.findByEmail.mockRejectedValue(new Error("DB Error"));
      await expect(
        authService.login(email, password, ip, userAgent)
      ).rejects.toThrow("DB Error");
    });
  });

  // ----------------------------------------------------
  // SECURE (Change Password)
  // ----------------------------------------------------
  describe("secure()", () => {
    const token = "secure-token";
    const oldPassword = "old123";
    const newPassword = "new123";

    it("should return error if token invalid", async () => {
      mockSecureCache.getUserIdfromToken.mockResolvedValue(null);
      const result = await authService.secure(token, oldPassword, newPassword);
      expect(result).toEqual({ error: "invaild Token", status: 400 });
    });

    it("should return error if old password incorrect", async () => {
      mockSecureCache.getUserIdfromToken.mockResolvedValue("user1");
      mockAuthRepo.findUserInfoById.mockResolvedValue({
        password: "hashedOld",
      });
      mockHasher.comparePassword.mockResolvedValue(false);

      const result = await authService.secure(token, oldPassword, newPassword);
      expect(result).toEqual({
        error: "old password is incorrect",
        status: 402,
      });
    });

    it("should return error if new password is same as old", async () => {
      mockSecureCache.getUserIdfromToken.mockResolvedValue("user1");
      mockAuthRepo.findUserInfoById.mockResolvedValue({
        password: "hashedOld",
      });
      mockHasher.comparePassword.mockResolvedValue(true);

      const result = await authService.secure(token, oldPassword, oldPassword);
      expect(result).toEqual({
        error: "you can not use same password as old password",
        status: 409,
      });
    });

    it("should update password and logout from all sessions", async () => {
      mockSecureCache.getUserIdfromToken.mockResolvedValue("user1");
      mockAuthRepo.findUserInfoById.mockResolvedValue({
        password: "hashedOld",
      });
      mockHasher.comparePassword.mockResolvedValue(true);
      mockHasher.Password.mockResolvedValue("hashedNew");
      mockAuthRepo.setPassword.mockResolvedValue({});
      (delAllsessions as jest.Mock).mockResolvedValue({});
      mockSecureCache.deleteToken.mockResolvedValue({});

      const result = await authService.secure(token, oldPassword, newPassword);

      expect(mockAuthRepo.setPassword).toHaveBeenCalledWith(
        "user1",
        "hashedNew"
      );
      expect(delAllsessions).toHaveBeenCalledWith({ userId: "user1" });
      expect(mockSecureCache.deleteToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        message: "password changed && logout form all devices successfully ",
      });
    });
  });
});
