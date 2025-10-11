import request from "supertest";
import App from "../../src/app";
const app = new App().getInstance();

describe("POST /api/auth/forgot-password", () => {
  const baseUrl = "/api/auth/forgot-password";

  it("Returns 200 when email exists and is verified", async () => {
    const res = await request(app).post(baseUrl).send({
      email: "test@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message:
        "If this email exists, password reset instructions have been sent.",
    });
  });

  it("Returns 400 if email is invalid format", async () => {
    const res = await request(app).post(baseUrl).send({
      email: "invalid-email",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"email" must be a valid email'],
    });
  });

  it("Returns 404 if email does not exist", async () => {
    const res = await request(app).post(baseUrl).send({
      email: "doesnotexist@example.com",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: "no User account found on this email",
    });
  });

  it("Returns 403 if email exists but is not verified or not primary", async () => {
    const res = await request(app).post(baseUrl).send({
      email: "secondary@example.com", // Simulate unverified email
    });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      message: "Email is not verified or not primary",
    });
  });

  it("Returns 400 if email is missing", async () => {
    const res = await request(app).post(baseUrl).send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"email" is required'],
    });
  });
});
