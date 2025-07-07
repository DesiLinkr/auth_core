import { Request } from "express";
import AuthController from "../../../src/controllers/auth.controller";
import { AuthService } from "../../../src/services/auth.service";

describe("AuthController - register", () => {
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

  const mockAuthService: Partial<AuthService> = {
    register: jest.fn(),
  };

  const authController = new AuthController(mockAuthService as AuthService);

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;

  const req = {
    body: {
      email: "test@example.com",
      name: "Test",
      password: "password123",
    },
  } as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user and return 201 with user data when input is valid", async () => {
    (mockAuthService.register as jest.Mock).mockResolvedValue(mockUserData);

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUserData);
  });

  it("should return 400 when user registration fails (userData is null)", async () => {
    (mockAuthService.register as jest.Mock).mockResolvedValue(null);

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User registration failed" });
  });

  it("should return 500 when AuthService throws an unexpected error", async () => {
    (mockAuthService.register as jest.Mock).mockRejectedValue(
      new Error("Internal server error")
    );

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });
});
