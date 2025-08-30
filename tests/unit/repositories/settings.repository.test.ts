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

  describe("setPassword", () => {
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
  });

  describe("findUserInfoById", () => {
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
  });
});
