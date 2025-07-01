import { Request } from "express";
import AuthController from "../../../src/controllers/auth.controller";

describe(" Auth Repository", () => {
  const mockUserData = {
    id: "user1",
    name: "Harsh",
    password: "secret",
    profileImage: "img.png",
    plan: "FREE", //  // assuming this is your enum value
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
  };
  const authController = new AuthController(mockAuthService as any);

  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

  const req = {
    body: {
      email: "test@example.com",
      name: "Test",
      password: "password123",
    },
  } as Request;

  it("should register a user and return 201 with user data when input is valid", async () => {
    mockAuthService.register.mockResolvedValue(mockUserData);
    await authController.register(req, res);
    expect(res).not.toBeNull();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUserData);
  });

  it("should return 400 when user registration fails (e.g., userData is null)", async () => {
    mockAuthService.register.mockResolvedValue(null);
    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith(mockUserData);
  });

  it("should return 500 when AuthService throws an unexpected error", async () => {
    mockAuthService.register.mockRejectedValue(
      new Error("Internal server error")
    );
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });
});
