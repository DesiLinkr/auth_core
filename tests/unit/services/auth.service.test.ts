import { PlanType } from "@prisma/client";
import { AuthService } from "../../../src/services/auth.service";

describe("Auth Service", () => {
  const mockAuthRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const authService = new AuthService(mockAuthRepo as any);
  const email = "test@emaple.com";
  const password = "1235475";
  const name = "test";

  it("should register a new user when email is not taken", async () => {
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

    mockAuthRepo.createUser.mockResolvedValue(mockUserData);

    const result = await authService.register(email, name, password);
    expect(result).not.toBeNull();
    expect(result).toEqual(mockUserData);
  });
  it("should throw an error when the email is already taken and verified", async () => {
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

    const result = await authService.register(name, email, password);

    expect(result).toEqual({
      error: "User already exists but not verified",
      status: 409,
    });
  });
  it("should throw an error when the email is already taken but not verified", async () => {
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
    const result = await authService.register(name, email, password);

    expect(result).toEqual({
      error: "User already exists but not verified",
      status: 409,
    });
  });
  it("should throw an internal server error if something unexpected occurs in repository", async () => {
    const mockRepo = {
      findByEmail: jest.fn().mockRejectedValue(new Error("DB crashed")),
      createUser: jest.fn(),
    };

    const authService = new AuthService(mockRepo as any); // ✅ Inject mock

    await expect(
      authService.register("test@example.com", "Test", "secret123")
    ).rejects.toThrow("DB crashed");
  });
});
