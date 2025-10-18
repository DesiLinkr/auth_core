import request from "supertest";
import App from "../../src/app";
import { SecureTokenCache } from "../../src/cache/secure.cache";
const app = new App().getInstance();

describe("Secure account Flow", () => {
  it("Returns 200 if token is valid", async () => {
    const cache = new SecureTokenCache();
    await cache.createToken(
      "83368aa2-9869-4cab-954a-b7b81f36992d",
      "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfd3",
      600
    );
    const res = await request(app).post("/api/auth/secure/verify").send({
      token: "f109a9ffc4de3044e07f6289d01afd5e6cbe03265864fed8ae167a3b0cb8bfd3",
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
});
