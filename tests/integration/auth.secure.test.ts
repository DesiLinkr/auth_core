import request from "supertest";
import App from "../../src/app";
import { SecureTokenCache } from "../../src/cache/secure.cache";
import { valid } from "joi";
const app = new App().getInstance();

describe("Secure account Flow", () => {
  let cache: SecureTokenCache;
  const userId = "6215c66f-f25a-4ebc-9612-f102a6931f0a";
  const validToken =
    "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfd3";

  beforeAll(async () => {
    cache = new SecureTokenCache();
    await cache.createToken(userId, validToken, 600);
  });

  it("Returns 200 if token is valid", async () => {
    const res = await request(app).post("/api/auth/secure/verify").send({
      token: validToken,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
    });
  });

  it("Returns 400 if token is missing", async () => {
    const res = await request(app).post("/api/auth/secure/verify").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"token" is required'],
    });
  });

  it("Returns 400  if token is invalid ", async () => {
    const res = await request(app).post("/api/auth/secure/verify").send({
      token: "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfds",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "invaild Token",
    });
  });

  it("Returns 200 if secure token and password are valid", async () => {
    const res = await request(app).post("/api/auth/secure/account").send({
      token: validToken,
      newPassword: "NewPass@123", // ✅ meets Joi pattern
      oldPassword: "StrongPass@123", // optional
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    await cache.createToken(userId, validToken, 600);

    await request(app).post("/api/auth/secure/account").send({
      token: validToken,
      newPassword: "StrongPass@123", // ✅ meets Joi pattern
      oldPassword: "NewPass@123", // optional
    });
  });

  it("Returns 400 if token is missing", async () => {
    const res = await request(app).post("/api/auth/secure/account").send({
      newPassword: "NewPass@123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"token" is required'],
    });
  });

  it("Returns 400 if newPassword is missing", async () => {
    const res = await request(app).post("/api/auth/secure/account").send({
      token: validToken,
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"newPassword" is required'],
    });
  });

  it("Returns 400 if token is invalid", async () => {
    const res = await request(app).post("/api/auth/secure/account").send({
      token: "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfd2",
      newPassword: "NewPass@123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "invaild Token",
    });
  });
});
