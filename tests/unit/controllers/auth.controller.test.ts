import { Request, Response } from "express";
import AuthController from "../../../src/controllers/auth.controller";

describe("Auth Controller (Updated)", () => {
  let mockCache: any;
  let req: Partial<Request>;
  let res: any;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    secure: jest.fn(),
    linkedinSignIn: jest.fn(),
    googleSignIn: jest.fn(),
    githubSignIn: jest.fn(),
  };

  const authController = new AuthController(mockAuthService as any);

  beforeEach(() => {
    req = {
      body: {},
      clientInfo: { ip: "127.0.0.1", user_agent: "Mozilla" },
    } as any;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    mockCache = {
      isvaildToken: jest.fn(),
    };

    (authController as any).cache = mockCache;
    jest.clearAllMocks();
  });

  // ------------------------ LINKEDIN ------------------------
  it("should return error when linkedinSignIn returns error", async () => {
    req.body = { code: "abc" };
    mockAuthService.linkedinSignIn.mockResolvedValue({
      error: "email not verified",
      status: 409,
    });

    await authController.linkedinSignIn(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "email not verified" });
  });

  it("should set refresh_token cookie & return success on linkedin login", async () => {
    req.body = { code: "abc" };
    mockAuthService.linkedinSignIn.mockResolvedValue({
      refreshToken: "rt123",
    });

    await authController.linkedinSignIn(req as Request, res as Response);

    expect(res.cookie).toHaveBeenCalledWith(
      "refresh_token",
      "rt123",
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should return 500 if linkedinSignIn throws", async () => {
    mockAuthService.linkedinSignIn.mockRejectedValue(new Error("Crash"));
    await authController.linkedinSignIn(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });

  // ------------------------ GITHUB ------------------------
  it("should return error when githubSignIn returns error", async () => {
    req.body = { code: "gh" };
    mockAuthService.githubSignIn.mockResolvedValue({
      error: "email not verified",
      status: 409,
    });

    await authController.githubSignIn(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "email not verified" });
  });

  it("should set cookie & return success on github login", async () => {
    req.body = { code: "gh" };
    mockAuthService.githubSignIn.mockResolvedValue({
      refreshToken: "gh_rt",
    });

    await authController.githubSignIn(req as Request, res as Response);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // ------------------------ GOOGLE ------------------------
  it("should set cookie & return success on google login", async () => {
    req.body = { code: "google" };
    mockAuthService.googleSignIn.mockResolvedValue({
      refreshToken: "g_rt",
    });

    await authController.googleSignIn(req as Request, res as Response);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // ------------------------ VERIFY TOKEN ------------------------
  it("should return success true if token valid", async () => {
    mockCache.isvaildToken.mockResolvedValue(true);

    await authController.secureVerifyToken(
      { body: { token: "valid" } } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should return 400 if token invalid", async () => {
    mockCache.isvaildToken.mockResolvedValue(false);

    await authController.secureVerifyToken(
      { body: { token: "bad" } } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invaild Token" });
  });

  // ------------------------ REGISTER ------------------------
  it("should register user", async () => {
    mockAuthService.register.mockResolvedValue({ id: "1" });

    await authController.register(
      { body: { email: "a", name: "b", password: "c" } } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ------------------------ LOGIN ------------------------
  it("should login, set cookie and return success", async () => {
    mockAuthService.login.mockResolvedValue({ refreshToken: "rt" });

    await authController.login(
      {
        body: { email: "a", password: "b" },
        clientInfo: { ip: "1.1.1.1", user_agent: "UA" },
      } as any,
      res
    );

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should return error if login fails", async () => {
    mockAuthService.login.mockResolvedValue(null);

    await authController.login(req as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ------------------------ SECURE ACCOUNT ------------------------
  it("should update password successfully", async () => {
    mockAuthService.secure.mockResolvedValue({ message: "ok" });

    await authController.secureAccount(
      {
        body: {
          token: "t",
          oldPassword: "o",
          newPassword: "n",
        },
      } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "ok" });
  });
});
