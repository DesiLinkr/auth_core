import { PlanType } from "@prisma/client";
import { AuthRepository } from "../../../src/repositories/auth.repository";
import { mockPrisma } from "../../../tests/mocks/prisma.mock";

describe("AuthRepository", () => {
  const AuthRepo = new AuthRepository(mockPrisma);
  const email = "test@example.com";

  const mockUser = {
    email,
    isPrimary: true,
    user: {
      name: "test",
      password: "hashedpwd",
      id: "der909ru804u0u8950",
    },
  };

  const mockUserData = {
    id: "user1",
    name: "Harsh",
    password: "secret",
    profileImage: "img.png",
    plan: PlanType.FREE,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ findByEmail()
  describe("findByEmail()", () => {
    it("should return null if email does not exist", async () => {
      (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(null);
      const user = await AuthRepo.findByEmail(email);
      expect(user).toBeNull();
      expect(mockPrisma.email.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          user: { select: { name: true, id: true, password: true } },
        },
      });
    });

    it("should return email with user if found by email", async () => {
      (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const user = await AuthRepo.findByEmail(email);
      expect(user).toBe(mockUser);
    });

    it("should throw error if Prisma fails", async () => {
      (mockPrisma.email.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB Error")
      );
      await expect(AuthRepo.findByEmail(email)).rejects.toThrow("DB Error");
    });
  });

  // ✅ findUserInfoById()
  describe("findUserInfoById()", () => {
    it("should return user info by ID without password field when user exists", async () => {
      const expectedUserInfo = {
        id: mockUserData.id,
        name: mockUserData.name,
        profileImage: mockUserData.profileImage,
        plan: mockUserData.plan,
        createdAt: mockUserData.createdAt,
        updatedAt: mockUserData.updatedAt,
        emails: mockUserData.emails,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(
        expectedUserInfo
      );

      const result = await AuthRepo.findUserInfoById(mockUserData.id);
      expect(result).toEqual(expectedUserInfo);
      expect(result?.password).toBeUndefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserData.id },
        omit: { password: true },
      });
    });

    it("should return user info by ID with password when requested", async () => {
      const userWithPassword = { ...mockUserData };
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(
        userWithPassword
      );

      const result = await AuthRepo.findUserInfoById(
        mockUserData.id,
        true // withPassword = true
      );
      expect(result?.password).toBeDefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserData.id },
        omit: { password: false },
      });
    });

    it("should return null when user does not exist", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await AuthRepo.findUserInfoById("non_existing_user_id");
      expect(result).toBeNull();
    });

    it("should throw error if Prisma fails", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Query failed")
      );
      await expect(AuthRepo.findUserInfoById("user1")).rejects.toThrow(
        "Query failed"
      );
    });
  });

  // ✅ createUser()
  describe("createUser()", () => {
    it("should create a user with provided data and return the created user", async () => {
      jest.spyOn(mockPrisma.user, "create").mockResolvedValue(mockUserData);

      const user = await AuthRepo.createUser(
        mockUser.email,
        mockUser.user.name,
        mockUser.user.password,
        "dd"
      );
      expect(user).toBe(mockUserData);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          profileImage: "dd",
          name: mockUser.user.name,
          password: mockUser.user.password,
          emails: {
            create: {
              email: mockUser.email,
              isPrimary: true,
              isVerified: false,
            },
          },
        },
        include: { emails: true },
      });
    });

    it("should throw error if Prisma create fails", async () => {
      jest
        .spyOn(mockPrisma.user, "create")
        .mockRejectedValue(new Error("Create failed"));

      await expect(
        AuthRepo.createUser("x@test.com", "X", "pwd")
      ).rejects.toThrow("Create failed");
    });
  });

  // ✅ setPassword()
  describe("setPassword()", () => {
    it("should update user password successfully", async () => {
      const updatedUser = { id: "u1", password: "newPass" };
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await AuthRepo.setPassword("u1", "newPass");
      expect(result).toBe(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { password: "newPass" },
      });
    });

    it("should throw error if password update fails", async () => {
      (mockPrisma.user.update as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );
      await expect(AuthRepo.setPassword("u1", "pass")).rejects.toThrow(
        "Update failed"
      );
    });
  });
});
