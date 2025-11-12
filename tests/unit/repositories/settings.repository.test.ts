import { settingsRepository } from "../../../src/repositories/settings.repository";
import { mockPrisma } from "../../mocks/prisma.mock";

describe("Settings Repository", () => {
  const SettingsRepo = new settingsRepository(mockPrisma);

  const mockUser = {
    id: "user123",
    name: "Harsh",
    password: "oldSecret",
    profileImage: "img.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmail = {
    id: "email123",
    email: "test@example.com",
    userId: "user123",
    isVerified: false,
    isPrimary: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should call prisma.delete with correct email", async () => {
    const email = "delete@example.com";
    (mockPrisma.email.delete as jest.Mock).mockResolvedValue({
      id: "1",
      email,
    });

    await SettingsRepo.removeEmail(email);

    expect(mockPrisma.email.delete).toHaveBeenCalledWith({
      where: { email },
    });
  });

  it("should throw error if delete fails", async () => {
    const email = "fail@example.com";
    (mockPrisma.email.delete as jest.Mock).mockRejectedValue(
      new Error("Delete failed")
    );

    await expect(SettingsRepo.removeEmail(email)).rejects.toThrow(
      "Delete failed"
    );
  });

  it("should return the email record if found", async () => {
    const email = "user@example.com";
    const userId = "user123";
    const mockRecord = { id: "email123", email, userId };

    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(mockRecord);

    const result = await SettingsRepo.checkEmailAssociatedWithUserId(
      email,
      userId
    );

    expect(mockPrisma.email.findUnique).toHaveBeenCalledWith({
      where: { email, userId },
    });
    expect(result).toEqual(mockRecord);
  });

  it("should return null when email not found", async () => {
    const email = "notfound@example.com";
    const userId = "user456";

    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await SettingsRepo.checkEmailAssociatedWithUserId(
      email,
      userId
    );

    expect(mockPrisma.email.findUnique).toHaveBeenCalledWith({
      where: { email, userId },
    });
    expect(result).toBeNull();
  });

  it("should update the password for a given userId", async () => {
    const updatedUser = { ...mockUser, password: "newSecret" };

    (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

    const result = await SettingsRepo.setPassword("user123", "newSecret");

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user123" },
      data: { password: "newSecret" },
    });

    expect(result).toEqual(updatedUser);
  });

  it("should add a new email record for the user", async () => {
    (mockPrisma.email.create as jest.Mock).mockResolvedValue(mockEmail);

    const result = await SettingsRepo.addEmailtoUser(
      "user123",
      "test@example.com"
    );

    expect(mockPrisma.email.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        userId: "user123",
        isVerified: false,
        isPrimary: false,
      },
    });

    expect(result).toEqual(mockEmail);
  });

  it("should return user info if user exists", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await SettingsRepo.findUserInfoById("user123");

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user123" },
    });

    expect(result).toEqual(mockUser);
  });

  it("should return null if user does not exist", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await SettingsRepo.findUserInfoById("non_existing_id");

    expect(result).toBeNull();
  });

  it("should return email record if found", async () => {
    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(mockEmail);

    const result = await SettingsRepo.checkEmailexits("test@example.com");

    expect(mockPrisma.email.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });

    expect(result).toEqual(mockEmail);
  });

  it("should return null if email does not exist", async () => {
    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await SettingsRepo.checkEmailexits("notfound@example.com");

    expect(result).toBeNull();
  });
});
