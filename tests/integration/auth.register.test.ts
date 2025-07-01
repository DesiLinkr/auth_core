import request from "supertest";
import App from "../../src/app";
const app = new App().getInstance();

describe("POST /api/auth/register", () => {
  const email = `${Date.now()}@example.com`;
  it("Registers a new user successfully with valid input", async () => {
    const body = {
      name: "Harsh",
      email,
      password: "StrongPass123",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body).not.toBeNull();
    expect(res.body).toHaveProperty("name", body.name);
    expect(res.body.emails[0]).toHaveProperty("email", body.email);
  });
  it("Returns 409 if email is already taken but not verified", async () => {
    const body = {
      name: "Harsh",
      email,
      password: "StrongPass123",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      message: "User already exists but not verified",
    });
  });

  it("Returns 409 if email is already taken  verified", async () => {
    const body = {
      name: "Harsh",
      email: "test@example.com",
      password: "StrongPass123",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      message: "User already exists",
    });
  });

  it("Returns 400 if email is missing", async () => {
    const body = {
      name: "Harsh",
      password: "StrongPass123",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"email" is required'],
    });
  });
  it("Returns 400 if name is missing", async () => {
    const body = {
      password: "StrongPass123",
      email: `${Date.now()}@example.com`,
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"name" is required'],
    });
  });

  it("Returns 400 if password is missing", async () => {
    const body = {
      name: "Harsh",
      email: `${Date.now()}@example.com`,
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"password" is required'],
    });
  });
  it("Returns 400 if body is empty", async () => {
    const body = {};
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);
  });

  it("Returns 400 if extra unexpected fields are sent", async () => {
    const body = {
      name: "Harsh",
      email: `${Date.now()}@example.com`,
      password: "StrongPass123",
      role: "admin",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"role" is not allowed'],
    });
  });

  it("Returns 400 if password is too short", async () => {
    const body = {
      name: "Harsh",
      email: `${Date.now()}@example.com`,
      password: "S123",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);

    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"password" length must be at least 8 characters long'],
    });
  });
  it("Returns 400 if name is too short", async () => {
    const body = {
      name: "Ha",
      email: `${Date.now()}@example.com`,
      password: "Strong123",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);

    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"name" length must be at least 5 characters long'],
    });
  });

  it("Returns 400 if email format is invalid", async () => {
    const body = {
      name: "Harsh",
      email: `${Date.now()}@email`,
      password: "Strong123",
    };
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"email" must be a valid email'],
    });
  });
});
