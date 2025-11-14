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

  // ---------------------------
  // REMOVE EMAIL (existing tests)
  // ---------------------------

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

    expect(result).toBeNull();
  });

  // ---------------------------
  // SET PASSWORD (existing tests)
  // ---------------------------

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

  // ---------------------------
  // ADD EMAIL (existing tests)
  // ---------------------------

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

  // ---------------------------
  // FIND USER (existing tests)
  // ---------------------------

  it("should return user info if user exists", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await SettingsRepo.findUserInfoById("user123");

    expect(result).toEqual(mockUser);
  });

  it("should return null if user does not exist", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await SettingsRepo.findUserInfoById("non_existing_id");

    expect(result).toBeNull();
  });

  // ---------------------------
  // CHECK EMAIL EXISTS (existing tests)
  // ---------------------------

  it("should return email record if found", async () => {
    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(mockEmail);

    const result = await SettingsRepo.checkEmailexits("test@example.com");

    expect(result).toEqual(mockEmail);
  });

  it("should return null if email does not exist", async () => {
    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await SettingsRepo.checkEmailexits("notfound@example.com");

    expect(result).toBeNull();
  });

  it("should throw error when old primary email is not found", async () => {
    mockPrisma.email.findFirst.mockResolvedValueOnce(null);

    mockPrisma.$transaction = jest.fn(async (fn: any) => fn(mockPrisma));

    await expect(
      SettingsRepo.changePrimaryEmail("user123", "new@example.com")
    ).rejects.toThrow("Primary email not found");
  });

  it("should throw error when new email is not found", async () => {
    mockPrisma.email.findFirst
      .mockResolvedValueOnce({ id: "1", isPrimary: true }) // old primary
      .mockResolvedValueOnce(null); // new email missing

    mockPrisma.$transaction = jest.fn(async (fn: any) => fn(mockPrisma));

    await expect(
      SettingsRepo.changePrimaryEmail("user123", "missing@example.com")
    ).rejects.toThrow("New email not found");
  });

  it("should update primary email successfully", async () => {
    const oldPrimary = { id: "1", isPrimary: true };
    const newEmailRecord = { id: "2", isPrimary: false };

    mockPrisma.email.findFirst
      .mockResolvedValueOnce(oldPrimary)
      .mockResolvedValueOnce(newEmailRecord);

    mockPrisma.email.update.mockResolvedValue(true);
    mockPrisma.$transaction = jest.fn(async (fn: any) => fn(mockPrisma));

    const result = await SettingsRepo.changePrimaryEmail(
      "user123",
      "new@example.com"
    );

    expect(mockPrisma.email.update).toHaveBeenCalledWith({
      where: { id: newEmailRecord.id },
      data: { isPrimary: true },
    });

    expect(mockPrisma.email.update).toHaveBeenCalledWith({
      where: { id: oldPrimary.id },
      data: { isPrimary: false },
    });

    expect(result).toEqual({
      message: "Primary email updated successfully",
    });
  });
});
