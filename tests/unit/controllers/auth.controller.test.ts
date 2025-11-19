import { Request, Response } from "express";
import AuthController from "../../../src/controllers/auth.controller";

describe("Auth Controller", () => {
  let mockCache: any;

  beforeEach(() => {
    mockCache = {
      isvaildToken: jest.fn(),
    };

    (authController as any).cache = mockCache;
  });
  const mockUserData = {
    id: "user1",
    name: "Harsh",
    password: "secret",
    profileImage: "img.png",
    plan: "FREE",
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

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    secure: jest.fn(),
    googleSignIn: jest.fn(),
  };

  const authController = new AuthController(mockAuthService as any);

  let res: Response;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    jest.clearAllMocks();
  });

  const reqRegister = {
    body: {
      email: "test@example.com",
      name: "Test",
      password: "password123",
    },
  } as Request;

  const reqLogin = {
    body: { email: "test@example.com", password: "password123" },
    clientInfo: { ip: "127.0.0.1", user_agent: "Mozilla/5.0" },
  } as any as Request;

  it("should return error status & message when AuthService.googleSignIn returns an error", async () => {
    mockAuthService.googleSignIn = jest.fn().mockResolvedValue({
      error: "Google email not verified",
      status: 409,
    });

    const reqGoogle = {
      body: { credential: "google-token" },
      clientInfo: { ip: "127.0.0.1", user_agent: "Mozilla/5.0" },
    } as any;

    await authController.googleSignIn(reqGoogle, res);

    expect(mockAuthService.googleSignIn).toHaveBeenCalledWith(
      "google-token",
      "127.0.0.1",
      "Mozilla/5.0"
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Google email not verified",
    });
  });

  it("should return 200 and session token when google login succeeds", async () => {
    mockAuthService.googleSignIn = jest.fn().mockResolvedValue({
      sessionId: "session123",
    });

    const reqGoogle = {
      body: { credential: "google-token" },
      clientInfo: { ip: "127.0.0.1", user_agent: "Mozilla/5.0" },
    } as any;

    await authController.googleSignIn(reqGoogle, res);

    expect(mockAuthService.googleSignIn).toHaveBeenCalledWith(
      "google-token",
      "127.0.0.1",
      "Mozilla/5.0"
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      sessionId: "session123",
    });
  });

  it("should return 500 when googleSignIn throws an exception", async () => {
    mockAuthService.googleSignIn = jest
      .fn()
      .mockRejectedValue(new Error("Google crash"));

    const reqGoogle = {
      body: { credential: "google-token" },
      clientInfo: { ip: "127.0.0.1", user_agent: "Mozilla/5.0" },
    } as any;

    await authController.googleSignIn(reqGoogle, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });

  it("should return 200 with success true if secure token is valid", async () => {
    mockCache.isvaildToken.mockResolvedValue(true);

    await authController.secureVerifyToken(
      { body: { token: "valid-token" } } as any,
      res
    );

    expect(mockCache.isvaildToken).toHaveBeenCalledWith("valid-token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should send 400 response if secure token is invalid", async () => {
    await authController.secureVerifyToken(
      { body: { token: "invalid-token" } } as any,
      res
    );

    expect(mockCache.isvaildToken).toHaveBeenCalledWith("invalid-token");
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 500 if an exception occurs in verifysecureToken", async () => {
    mockCache.isvaildToken.mockRejectedValue(new Error("Redis crash"));

    await authController.secureVerifyToken(
      { body: { token: "any-token" } } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });
  // ------------------------ REGISTER ------------------------
  it("should register a user and return 201 with user data", async () => {
    mockAuthService.register.mockResolvedValue(mockUserData);
    await authController.register(reqRegister, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUserData);
  });

  it("should return 400 when user registration fails", async () => {
    mockAuthService.register.mockResolvedValue(null);
    await authController.register(reqRegister, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "User registration failed",
    });
  });

  it("should return 500 if AuthService.register throws", async () => {
    mockAuthService.register.mockRejectedValue(
      new Error("Internal server error")
    );
    await authController.register(reqRegister, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });

  // ------------------------ LOGIN ------------------------
  it("should return 200 and userData when login succeeds", async () => {
    mockAuthService.login.mockResolvedValue(mockUserData);
    await authController.login(reqLogin, res);

    expect(mockAuthService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
      "127.0.0.1",
      "Mozilla/5.0"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUserData);
  });

  it("should return 400 if login returns null", async () => {
    mockAuthService.login.mockResolvedValue(null);
    await authController.login(reqLogin, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registration failed",
    });
  });

  it("should return the error status if login returns an error object", async () => {
    const errorObj = { error: "Invalid credentials", status: 402 };
    mockAuthService.login.mockResolvedValue(errorObj);

    await authController.login(reqLogin, res);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("should return 500 if AuthService.login throws", async () => {
    mockAuthService.login.mockRejectedValue(new Error("Something went wrong"));

    await authController.login(reqLogin, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Something went wrong");
  });

  // ------------------------ SECURE ACCOUNT ------------------------
  it("should return 200 and result when secureAccount succeeds", async () => {
    const mockResult = { message: "Password updated successfully" };
    mockAuthService.secure = jest.fn().mockResolvedValue(mockResult);

    const reqSecure = {
      body: {
        token: "valid-token",
        oldPassword: "oldPass123",
        newPassword: "newPass456",
      },
    } as any as Request;

    await authController.secureAccount(reqSecure, res);

    expect(mockAuthService.secure).toHaveBeenCalledWith(
      "valid-token",
      "oldPass123",
      "newPass456"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("should return error status and message when AuthService.secure returns error", async () => {
    const errorResponse = { error: "Invalid token", status: 403 };
    mockAuthService.secure = jest.fn().mockResolvedValue(errorResponse);

    const reqSecure = {
      body: {
        token: "invalid-token",
        oldPassword: "oldPass",
        newPassword: "newPass",
      },
    } as any as Request;

    await authController.secureAccount(reqSecure, res);

    expect(mockAuthService.secure).toHaveBeenCalledWith(
      "invalid-token",
      "oldPass",
      "newPass"
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("should return 500 if AuthService.secure throws an error", async () => {
    mockAuthService.secure = jest
      .fn()
      .mockRejectedValue(new Error("Unexpected failure"));

    const reqSecure = {
      body: {
        token: "any-token",
        oldPassword: "pass1",
        newPassword: "pass2",
      },
    } as any as Request;

    await authController.secureAccount(reqSecure, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });
});
