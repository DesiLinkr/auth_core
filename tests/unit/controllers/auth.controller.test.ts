import { Request, Response } from "express";
import AuthController from "../../../src/controllers/auth.controller";

describe("Auth Controller", () => {
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
  it("should return 201 and userData when login succeeds", async () => {
    mockAuthService.login.mockResolvedValue(mockUserData);
    await authController.login(reqLogin, res);

    expect(mockAuthService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
      "127.0.0.1",
      "Mozilla/5.0"
    );
    expect(res.status).toHaveBeenCalledWith(201);
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
    const errorObj = { error: "incorrect password", status: 402 };
    mockAuthService.login.mockResolvedValue(errorObj);

    await authController.login(reqLogin, res);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({ message: "incorrect password" });
  });

  it("should return 500 if AuthService.login throws", async () => {
    mockAuthService.login.mockRejectedValue(new Error("Something went wrong"));

    await authController.login(reqLogin, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Something went wrong");
  });
});
