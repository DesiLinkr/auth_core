import { PlanType } from "@prisma/client";
import { AuthRepository } from "../../../src/repositories/auth.repository";
import { mockPrisma } from "../../../tests/mocks/prisma.mock";
describe(" Auth Repository", () => {
  const AuthRepo = new AuthRepository(mockPrisma);
  const email = "test@example.com";

  const mockUser = {
    email: "test@example.com",
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

  it("should return null if email does not exist", async () => {
    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(null);
    const user = await AuthRepo.findByEmail(email);
    expect(user).toBeNull();
  });

  it("should return email with user if found by email ", async () => {
    (mockPrisma.email.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const user = await AuthRepo.findByEmail(email);
    expect(user).not.toBeNull();
    expect(user).toBe(mockUser);
  });
  it("should return user info by ID without password field when user exists", async () => {
    const expectedUserInfo = {
      id: mockUserData.id,
      name: mockUserData.name,
      profileImage: mockUserData.profileImage,
      plan: mockUserData.plan,
      createdAt: mockUserData.createdAt,
      updatedAt: mockUserData.updatedAt,
      emails: mockUserData.emails,
      // password field intentionally omitted
    };

    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(
      expectedUserInfo
    );

    const result: any = await AuthRepo.findUserInfoById(mockUserData.id);
    ``;
    expect(result).toEqual(expectedUserInfo);
    expect(result?.password).toBeUndefined(); // make sure password is not present
  });

  it("should return null when user does not exist", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await AuthRepo.findUserInfoById("non_existing_user_id");

    expect(result).toBeNull();
  });

  it("should create a user with provided data &&  return the created user object on success  ", async () => {
    jest.spyOn(mockPrisma.user, "create").mockResolvedValue(mockUserData);

    const user = await AuthRepo.createUser(
      mockUser.email,
      mockUser.user.name,
      mockUser.user.password,
      "dd"
    );
    expect(user).not.toBeNull();
    expect(user).toBe(mockUserData);
  });
});
