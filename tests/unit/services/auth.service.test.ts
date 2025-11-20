import { PlanType } from "@prisma/client";
import { AuthService } from "../../../src/services/auth.service";
import axios from "axios";
jest.mock("axios");
// -------------------------------------------
// Mock gRPC utilities

const githubCode = "dummy-code";

// Mock axios
const githubAxiosPost = axios.post as jest.Mock;
const githubAxiosGet = axios.get as jest.Mock;
jest.mock("../../../src/utils/grpc.util", () => ({
  sendVerificationEmail: jest.fn(),
  sendAcesssEmail: jest.fn(),
  createSession: jest.fn(),
  delAllsessions: jest.fn(),
}));

import {
  sendVerificationEmail,
  sendAcesssEmail,
  createSession,
  delAllsessions,
} from "../../../src/utils/grpc.util";

describe("AuthService", () => {
  // -------------------------------------------
  // Core Mocks
  // -------------------------------------------
  const mockAuthRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findUserInfoById: jest.fn(),
    setPassword: jest.fn(),
  };

  const mockHasher = {
    Password: jest.fn(),
    generateToken: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockVerificationCache = {
    createToken: jest.fn(),
  };

  const mockSecureCache = {
    createToken: jest.fn(),
    deleteToken: jest.fn(),
    getUserIdfromToken: jest.fn(),
  };

  const mockClient = {
    verifyIdToken: jest.fn(),
  };

  const authService: any = new AuthService(
    mockSecureCache as any,
    mockAuthRepo as any,
    mockVerificationCache as any
  );

  // Shared Inputs
  const email = "test@example.com";
  const password = "secret123";
  const name = "Test User";
  const ip = "192.168.1.10";
  const userAgent = "Mozilla/5.0";

  // Google vars
  const credential = "google-id-token";
  const payload = {
    email: "test@example.com",
    name: "Harsh",
    picture: "pic.png",
    email_verified: true,
  };

  function mockGooglePayload(data = payload) {
    mockClient.verifyIdToken.mockResolvedValue({
      getPayload: () => data,
    });
  }

  // -------------------------------------------
  // Setup
  // -------------------------------------------
  beforeEach(() => {
    jest.clearAllMocks();

    process.env.url = "http://localhost";
    process.env.PORT = "5000";
    process.env.GOOGLE_CLIENT_ID = "google-client-id";

    authService.hasher = mockHasher;
    authService.client = mockClient;
    authService.AuthRepo = mockAuthRepo;
  });

  // -------------------------------------------------------------------
  // ✅ GOOGLE SIGN IN TESTS (inside same describe)
  // -------------------------------------------------------------------
  // -------------------------------------------------------------------
  // ✅ LINKEDIN SIGN-IN TESTS
  // -------------------------------------------------------------------

  const linkedinAxiosPost = axios.post as jest.Mock;
  const linkedinAxiosGet = axios.get as jest.Mock;

  it("should return error if LinkedIn code missing", async () => {
    const result = await authService.linkedinSignIn("", ip, userAgent);

    expect(result).toEqual({
      error: "code is required",
      status: 400,
    });
  });

  it("should create new LinkedIn user if not exists", async () => {
    // LinkedIn token
    linkedinAxiosPost.mockResolvedValue({
      data: { access_token: "li_token_123" },
    });

    // LinkedIn profile
    linkedinAxiosGet
      .mockResolvedValueOnce({
        data: {
          localizedFirstName: "Harsh",
          localizedLastName: "Tagra",
          profilePicture: {
            "displayImage~": {
              elements: [
                {
                  identifiers: [
                    { identifier: "https://linkedin.com/avatar123" },
                  ],
                },
              ],
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          elements: [
            { "handle~": { emailAddress: "harsh.linkedin@mail.com" } },
          ],
        },
      });

    mockAuthRepo.findByEmail.mockResolvedValue(null);

    mockAuthRepo.createUser.mockResolvedValue({
      id: "u101",
      email: "harsh.linkedin@mail.com",
      name: "Harsh Tagra",
      user: { id: "u101", name: "Harsh Tagra" },
    });

    mockHasher.generateToken.mockResolvedValue("liSecureToken");
    mockSecureCache.createToken.mockResolvedValue({});
    (createSession as jest.Mock).mockResolvedValue({ sessionId: "sessLIN1" });

    const result = await authService.linkedinSignIn("li-code", ip, userAgent);

    expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
      "harsh.linkedin@mail.com",
      "Harsh Tagra",
      null,
      true,
      "https://linkedin.com/avatar123"
    );

    expect(result).toEqual({ sessionId: "sessLIN1" });
  });

  it("should login existing LinkedIn user", async () => {
    linkedinAxiosPost.mockResolvedValue({
      data: { access_token: "li_token_555" },
    });

    linkedinAxiosGet
      .mockResolvedValueOnce({
        data: {
          localizedFirstName: "Existing",
          localizedLastName: "User",
          profilePicture: {
            "displayImage~": {
              elements: [
                {
                  identifiers: [{ identifier: "https://li/avatar2.png" }],
                },
              ],
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          elements: [{ "handle~": { emailAddress: "existing@mail.com" } }],
        },
      });

    mockAuthRepo.findByEmail.mockResolvedValue({
      user: { id: "u500", name: "Existing User" },
      email: "existing@mail.com",
      isVerified: true,
    });

    mockHasher.generateToken.mockResolvedValue("secureToken");
    mockSecureCache.createToken.mockResolvedValue({});
    (createSession as jest.Mock).mockResolvedValue({
      sessionId: "LI_EXIST_SESSION",
    });

    const result = await authService.linkedinSignIn("li-code", ip, userAgent);

    expect(result).toEqual({ sessionId: "LI_EXIST_SESSION" });
  });

  it("should send access email for existing LinkedIn user", async () => {
    linkedinAxiosPost.mockResolvedValue({
      data: { access_token: "li_token_x" },
    });

    linkedinAxiosGet
      .mockResolvedValueOnce({
        data: {
          localizedFirstName: "Access",
          localizedLastName: "Notify",
        },
      })
      .mockResolvedValueOnce({
        data: {
          elements: [{ "handle~": { emailAddress: "notify@mail.com" } }],
        },
      });

    mockAuthRepo.findByEmail.mockResolvedValue({
      user: { id: "u99", name: "Access Notify" },
      email: "notify@mail.com",
      isVerified: true,
    });

    mockHasher.generateToken.mockResolvedValue("secureLinkedIN");
    mockSecureCache.createToken.mockResolvedValue({});
    (createSession as jest.Mock).mockResolvedValue({
      sessionId: "notifyLIN",
    });

    const result = await authService.linkedinSignIn("codeXYZ", ip, userAgent);

    expect(sendAcesssEmail).toHaveBeenCalled();
    expect(result).toEqual({ sessionId: "notifyLIN" });
  });

  it("should throw error if LinkedIn token request fails", async () => {
    linkedinAxiosPost.mockRejectedValue(new Error("LinkedIn Down"));

    await expect(
      authService.linkedinSignIn("badcode", ip, userAgent)
    ).rejects.toThrow("LinkedIn Down");
  });

  it("should throw error if LinkedIn profile fetch fails", async () => {
    linkedinAxiosPost.mockResolvedValue({
      data: { access_token: "oktok" },
    });

    linkedinAxiosGet.mockRejectedValue(new Error("Profile Fail"));

    await expect(
      authService.linkedinSignIn("123", ip, userAgent)
    ).rejects.toThrow("Profile Fail");
  });

  it("should return error if user exists but email not verified", async () => {
    mockGooglePayload();

    mockAuthRepo.findByEmail.mockResolvedValue({
      id: "u1",
      email: payload.email,
      isVerified: false,
    });

    const result = await authService.googleSignIn(credential, ip, userAgent);

    expect(result).toEqual({
      error: "email not verified",
      status: 409,
    });
  });

  it("should return error if Google email not verified", async () => {
    mockGooglePayload({ ...payload, email_verified: false });
    mockAuthRepo.findByEmail.mockResolvedValue(null);

    const result = await authService.googleSignIn(credential, ip, userAgent);

    expect(result).toEqual({
      error: "Google email not verified",
      status: 409,
    });
  });

  it("should create new Google user if user does not exist", async () => {
    mockGooglePayload();
    mockAuthRepo.findByEmail.mockResolvedValue(null);

    mockAuthRepo.createUser.mockResolvedValue({
      id: "newUser",
      email: payload.email,
      name: payload.name,
      isVerified: true,
    });

    mockHasher.generateToken.mockResolvedValue("secureToken");
    (createSession as jest.Mock).mockResolvedValue({ sessionId: "s1" });
    mockSecureCache.createToken.mockResolvedValue({});
    (sendAcesssEmail as jest.Mock).mockResolvedValue({});

    const result = await authService.googleSignIn(credential, ip, userAgent);

    expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
      payload.email,
      payload.name,
      null,
      true,
      payload.picture
    );

    expect(result).toEqual({ sessionId: "s1" });
  });

  it("should login existing verified Google user", async () => {
    mockGooglePayload();

    mockAuthRepo.findByEmail.mockResolvedValue({
      id: "u99",
      email: payload.email,
      name: payload.name,
      isVerified: true,
    });

    mockHasher.generateToken.mockResolvedValue("secureTok");
    mockSecureCache.createToken.mockResolvedValue({});
    (createSession as jest.Mock).mockResolvedValue({ sessionId: "abc" });

    const result = await authService.googleSignIn(credential, ip, userAgent);

    expect(result).toEqual({ sessionId: "abc" });
  });

  it("should throw error if verifyIdToken fails", async () => {
    mockClient.verifyIdToken.mockRejectedValue(new Error("Google OAuth Down"));

    await expect(
      authService.googleSignIn(credential, ip, userAgent)
    ).rejects.toThrow("Google OAuth Down");
  });

  // -------------------------------------------------------------------
  // ✅ REGISTER
  // -------------------------------------------------------------------

  it("should register a new user when email not taken", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue(null);
    mockHasher.Password.mockResolvedValue("hashedPwd");
    mockHasher.generateToken.mockResolvedValue("token123");
    mockVerificationCache.createToken.mockResolvedValue(true);
    (sendVerificationEmail as jest.Mock).mockResolvedValue({ msg: "ok" });

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
          email,
          isPrimary: true,
          isVerified: true,
          userId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    mockAuthRepo.createUser.mockResolvedValue(mockUserData);

    const result = await authService.register(name, email, password);

    expect(result).toEqual(expect.objectContaining({ id: "user1" }));
  });

  it("should return error when email exists and verified", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({ isVerified: true });
    const result = await authService.register(name, email, password);
    expect(result).toEqual({ error: "User already exists", status: 409 });
  });

  it("should return error when email exists but not verified", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({ isVerified: false });
    const result = await authService.register(name, email, password);
    expect(result).toEqual({
      error: "User already exists but not verified",
      status: 409,
    });
  });

  it("should return error if user creation fails", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue(null);
    mockHasher.Password.mockResolvedValue("hashedPwd");
    mockAuthRepo.createUser.mockResolvedValue(null);

    const result = await authService.register(name, email, password);

    expect(result).toEqual({
      error: "User registration failed",
      status: 422,
    });
  });

  it("should throw error if repo fails during register", async () => {
    mockAuthRepo.findByEmail.mockRejectedValue(new Error("DB crashed"));

    await expect(authService.register(name, email, password)).rejects.toThrow(
      "DB crashed"
    );
  });

  // -------------------------------------------------------------------
  // ✅ LOGIN
  // -------------------------------------------------------------------

  it("should return error if user not found", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue(null);
    const result = await authService.login(email, password, ip, userAgent);
    expect(result).toEqual({ error: "Invalid credentials", status: 402 });
  });

  it("should return error if not primary", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({ isPrimary: false });
    const result = await authService.login(email, password, ip, userAgent);
    expect(result).toEqual({ error: "Invalid credentials", status: 402 });
  });

  it("should return error if email not verified", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({
      isPrimary: true,
      isVerified: false,
    });

    const result = await authService.login(email, password, ip, userAgent);

    expect(result).toEqual({
      error: "User already exists but not verified",
      status: 409,
    });
  });

  it("should return error if password incorrect", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({
      isPrimary: true,
      isVerified: true,
      user: { password: "hashedPwd" },
    });

    mockHasher.comparePassword.mockResolvedValue(false);

    const result = await authService.login(email, password, ip, userAgent);

    expect(result).toEqual({ error: "Invalid credentials", status: 401 });
  });

  it("should login successfully & send access email", async () => {
    mockAuthRepo.findByEmail.mockResolvedValue({
      isPrimary: true,
      isVerified: true,
      email,
      user: { id: "u1", name: "Harsh", password: "hashedPwd" },
    });

    mockHasher.comparePassword.mockResolvedValue(true);
    mockHasher.generateToken.mockResolvedValue("secureToken");

    (createSession as jest.Mock).mockResolvedValue({ sessionId: "s1" });
    mockSecureCache.createToken.mockResolvedValue({});
    (sendAcesssEmail as jest.Mock).mockResolvedValue({});

    const result = await authService.login(email, password, ip, userAgent);

    expect(result).toEqual({ sessionId: "s1" });
  });

  // -------------------------------------------------------------------
  // ✅ SECURE (Change Password)
  // -------------------------------------------------------------------

  it("should return error if token is invalid", async () => {
    mockSecureCache.getUserIdfromToken.mockResolvedValue(null);

    const result = await authService.secure("token", "oldpass", "newpass");

    expect(result).toEqual({ error: "invaild Token", status: 400 });
  });

  it("should return error if old password incorrect", async () => {
    mockSecureCache.getUserIdfromToken.mockResolvedValue("u1");

    mockAuthRepo.findUserInfoById.mockResolvedValue({
      password: "hashedOld",
    });

    mockHasher.comparePassword.mockResolvedValue(false);

    const result = await authService.secure("token", "oldpass", "newpass");

    expect(result).toEqual({
      error: "old password is incorrect",
      status: 402,
    });
  });

  it("should return error if reused password", async () => {
    mockSecureCache.getUserIdfromToken.mockResolvedValue("u1");

    mockAuthRepo.findUserInfoById.mockResolvedValue({
      password: "hashedOld",
    });

    mockHasher.comparePassword.mockResolvedValue(true);

    const result = await authService.secure("token", "oldpass", "oldpass");

    expect(result).toEqual({
      error: "you can not use same password as old password",
      status: 409,
    });
  });

  it("should update password & logout all sessions", async () => {
    mockSecureCache.getUserIdfromToken.mockResolvedValue("u1");

    mockAuthRepo.findUserInfoById.mockResolvedValue({
      password: "hashedOld",
    });

    mockHasher.comparePassword.mockResolvedValue(true);
    mockHasher.Password.mockResolvedValue("hashedNew");

    mockAuthRepo.setPassword.mockResolvedValue({});
    (delAllsessions as jest.Mock).mockResolvedValue({});
    mockSecureCache.deleteToken.mockResolvedValue({});

    const result = await authService.secure("token", "oldpass", "newpass");

    expect(result).toEqual({
      message: "password changed && logout form all devices successfully ",
    });
  });

  it("should return error if GitHub email not found", async () => {
    githubAxiosPost.mockResolvedValue({
      data: { access_token: "gh_token" },
    });

    githubAxiosGet
      .mockResolvedValueOnce({ data: { name: "GH User" } }) // /user
      .mockResolvedValueOnce({ data: [] }); // /emails → no primary email

    const result = await authService.githubSignIn(githubCode, ip, userAgent);

    expect(result).toEqual({
      error: "GitHub email not available",
      status: 400,
    });
  });

  it("should block existing user if not verified", async () => {
    githubAxiosPost.mockResolvedValue({
      data: { access_token: "gh_token" },
    });

    githubAxiosGet
      .mockResolvedValueOnce({ data: { name: "OldUser" } }) // /user
      .mockResolvedValueOnce({
        data: [{ email: "old@mail.com", primary: true }],
      }); // /emails

    mockAuthRepo.findByEmail.mockResolvedValue({
      email: "old@mail.com",
      isVerified: false,
    });

    const result = await authService.githubSignIn(githubCode, ip, userAgent);

    expect(result).toEqual({
      error: "email not verified",
      status: 409,
    });
  });

  it("should create new GitHub user if not exists", async () => {
    githubAxiosPost.mockResolvedValue({
      data: { access_token: "token123" },
    });

    githubAxiosGet
      .mockResolvedValueOnce({
        data: { name: "NewGHUser", avatar_url: "pic.jpg" },
      })
      .mockResolvedValueOnce({
        data: [{ email: "new@mail.com", primary: true }],
      });

    mockAuthRepo.findByEmail.mockResolvedValue(null);

    const createdUser = {
      id: "newUserId",
      email: "new@mail.com",
      name: "NewGHUser",
      user: { id: "newUserId", name: "NewGHUser" },
    };

    mockAuthRepo.createUser.mockResolvedValue(createdUser);

    mockHasher.generateToken.mockResolvedValue("secure123");
    mockSecureCache.createToken.mockResolvedValue({});
    (createSession as jest.Mock).mockResolvedValue({
      sessionId: "sess123",
    });

    const result = await authService.githubSignIn(githubCode, ip, userAgent);

    expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
      "new@mail.com",
      "NewGHUser",
      null,
      true,
      "pic.jpg"
    );

    expect(result).toEqual({ sessionId: "sess123" });
  });

  it("should login existing verified GitHub user", async () => {
    githubAxiosPost.mockResolvedValue({
      data: { access_token: "abc_token" },
    });

    githubAxiosGet
      .mockResolvedValueOnce({
        data: { name: "ExistingUser", avatar_url: "avt.png" },
      })
      .mockResolvedValueOnce({
        data: [{ email: "exist@mail.com", primary: true }],
      });

    mockAuthRepo.findByEmail.mockResolvedValue({
      user: { id: "u44", name: "ExistingUser" },
      email: "exist@mail.com",
      isVerified: true,
    });

    (createSession as jest.Mock).mockResolvedValue({
      sessionId: "xyz123",
    });

    mockHasher.generateToken.mockResolvedValue("secureGHToken");
    mockSecureCache.createToken.mockResolvedValue({});

    const result = await authService.githubSignIn(githubCode, ip, userAgent);

    expect(result).toEqual({ sessionId: "xyz123" });
  });
});
