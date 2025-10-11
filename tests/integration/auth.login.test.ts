import request from "supertest";
import App from "../../src/app";

const app = new App().getInstance();

describe("POST /api/auth/login", () => {
  const validUser = {
    email: "test@example.com",
    password: "StrongPass123",
  };

  it("Logs in successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send(validUser)
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");
    expect(res.status).toBe(200);
    expect(res.body).not.toBeNull();
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("Returns 401 if password is incorrect", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
        password: "WrongPassword",
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      message: "Invalid credentials",
    });
  });

  it("Returns 404 if email is not registered", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notexist@example.com",
        password: "StrongPass123",
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(402);
    expect(res.body).toEqual({
      message: "Invalid credentials",
    });
  });

  it("Returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        password: "StrongPass123",
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"email" is required'],
    });
  });

  it("Returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"password" is required'],
    });
  });

  it("Returns 400 if email format is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "invalid-email",
        password: "StrongPass123",
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"email" must be a valid email'],
    });
  });

  it("Returns 400 if extra unexpected fields are sent", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
        password: validUser.password,
        token: "extra-field",
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"token" is not allowed'],
    });
  });

  it("Returns 400 if body is empty", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({})
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");
    expect(res.statusCode).toBe(400);
  });

  it("Returns 403 if email exists but is not primary", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "secondary@example.com",
        password: "StrongPass123",
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(402);
    expect(res.body).toEqual({
      message: "Invalid credentials",
    });
  });
});
