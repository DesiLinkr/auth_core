import request from "supertest";
import App from "../../src/app";
import { ForgotPasswordTokenCache } from "../../src/cache/forgotPassword.cache";
const app = new App().getInstance();

describe("Forgot Password Flow", () => {
  const forgotPasswordUrl = "/api/auth/forgot-password";
  const verifyResetTokenUrl = "/api/auth/verify_reset_token";

  // -------------------------------------------------------------------------
  // 🧩 POST /api/auth/forgot-password
  // -------------------------------------------------------------------------
  it("Returns 200 when email exists and is verified", async () => {
    const res = await request(app).post(forgotPasswordUrl).send({
      email: "test@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message:
        "If this email exists, password reset instructions have been sent.",
    });
  });

  it("Returns 400 if email is invalid format", async () => {
    const res = await request(app).post(forgotPasswordUrl).send({
      email: "invalid-email",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"email" must be a valid email'],
    });
  });

  it("Returns 404 if email does not exist", async () => {
    const res = await request(app).post(forgotPasswordUrl).send({
      email: "doesnotexist@example.com",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: "no User account found on this email",
    });
  });

  it("Returns 403 if email exists but is not verified or not primary", async () => {
    const res = await request(app).post(forgotPasswordUrl).send({
      email: "secondary@example.com", // Simulate unverified email
    });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      message: "Email is not verified or not primary",
    });
  });

  it("Returns 400 if email is missing", async () => {
    const res = await request(app).post(forgotPasswordUrl).send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"email" is required'],
    });
  });

  // -------------------------------------------------------------------------
  // 🧩 POST /api/auth/verify-reset-token
  // -------------------------------------------------------------------------
  it("Returns 200 if token is valid", async () => {
    const cache = new ForgotPasswordTokenCache();
    await cache.createToken(
      "83368aa2-9869-4cab-954a-b7b81f36992d",
      "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfd3",
      600
    );
    const res = await request(app).post(verifyResetTokenUrl).send({
      token: "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfd3",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
    });
  });

  it("Returns 400 if token is missing", async () => {
    const res = await request(app).post(verifyResetTokenUrl).send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"token" is required'],
    });
  });

  it("Returns 400  if token is invalid ", async () => {
    const res = await request(app).post(verifyResetTokenUrl).send({
      token: "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfds",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "invaild Token",
    });
  });

  const baseUrl = "/api/auth/reset-password";
  it("Returns 200 when valid token and new password are provided", async () => {
    // Mock valid token and password
    const res = await request(app).post(baseUrl).send({
      token: "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfd3",
      password: "Test@1234",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "password changed");
  });

  it("Returns 400 when token is missing", async () => {
    const res = await request(app).post(baseUrl).send({
      password: "StrongPass123!",
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      details: ['"token" is required'],
      error: "Validation error",
    });
  });

  it("Returns 400 when token is expired or invalid", async () => {
    const res = await request(app).post(baseUrl).send({
      token: "invalid_token",
      Password: "StrongPass123!",
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      details: ['"token" length must be 64 characters long'],
      error: "Validation error",
    });
  });
});
