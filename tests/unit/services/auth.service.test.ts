import { PlanType } from "@prisma/client";
import { AuthService } from "../../../src/services/auth.service";
// ✅ Mock external gRPC utilities
jest.mock("../../../src/utils/grpc.util");

// ✅ Bring mocked version in
import * as grpcUtil from "../../../src/utils/grpc.util";
const mockedGrpc = grpcUtil as jest.Mocked<typeof grpcUtil>;
const { sendVerificationEmail, sendAcesssEmail, createSession } = mockedGrpc;
describe("AuthService", () => {
  const mockAuthRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
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
  };

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
    (authService as any).Hasher = mockHasher;
  });

  // -----------------------------------------------
  // REGISTER TESTS
  // -----------------------------------------------
  it("should register a new user when email is not taken", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue(null);
    mockHasher.Password.mockResolvedValue("hashedPwd");
    mockHasher.generateToken.mockResolvedValue("token123");
    mockVerificationCache.createToken.mockResolvedValue(true);
    sendVerificationEmail.mockResolvedValue({ msg: "ok" });

    const mockUserData = {
      id: "user1",
      name: "Harsh",
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

  it("should throw an error if repository fails", async () => {
    mockAuthRepo.findByEmail.mockRejectedValue(new Error("DB crashed"));
    await expect(authService.register(name, email, password)).rejects.toThrow(
      "DB crashed"
    );
  });

  // -----------------------------------------------
  // LOGIN TESTS
  // -----------------------------------------------
  it("should return error if user not found", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue(null);
    const result = await authService.login(email, password, ip, userAgent);
    expect(result).toEqual({
      error: "incorrect password or email",
      status: 402,
    });
  });

  it("should return error if email exists but not verified", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({
      isVerified: false,
      primary: true,
    });
    const result = await authService.login(email, password, ip, userAgent);
    expect(result).toEqual({
      error: "User already exists but not verified",
      status: 409,
    });
  });

  it("should return error if password does not match", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({
      isVerified: true,
      primary: true,
      user: { password: "hashed123" },
    });

    mockHasher.comparePassword.mockResolvedValue(false);

    const result = await authService.login(email, password, ip, userAgent);
    expect(result).toEqual({
      error: "incorrect password or email",
      status: 402,
    });
  });

  it("should create session and send access email on successful login", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({
      isVerified: true,
      primary: true,
      user: { id: "u123", name, password: "hashedPwd" },
      email,
    });

    mockHasher.comparePassword.mockResolvedValue(true);
    mockHasher.generateToken.mockResolvedValue("token123");
    createSession.mockResolvedValue({ refreshToken: "session-token" });
    mockSecureCache.createToken.mockResolvedValue(true);
    sendAcesssEmail.mockResolvedValue({ msg: "ok" });

    const result = await authService.login(email, password, ip, userAgent);

    expect(mockHasher.comparePassword).toHaveBeenCalled();
    expect(createSession).toHaveBeenCalledWith({
      ip,
      userId: "u123",
      userAgent,
    });
    expect(mockSecureCache.createToken).toHaveBeenCalledWith(
      "u123",
      "token123",
      expect.any(Number)
    );
    expect(sendAcesssEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        name,
        ipAddress: ip,
        secureAccountUrl: expect.stringContaining("token123"),
      })
    );
    expect(result).toEqual({ refreshToken: "session-token" });
  });

  it("should throw if repo fails during login", async () => {
    mockAuthRepo.findByEmail.mockRejectedValue(new Error("DB Error"));
    await expect(
      authService.login(email, password, ip, userAgent)
    ).rejects.toThrow("DB Error");
  });
});
