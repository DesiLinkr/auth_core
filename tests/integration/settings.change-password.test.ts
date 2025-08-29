import request from "supertest";
import App from "../../src/app";
const app = new App().getInstance();
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmE5ZGVlNjQtNzRmNi00ZWY0LWFiZDQtNWY2NmMyNTVlNWQ4Iiwic2Vzc2lvbl9pZCI6MTI4LCJpYXQiOjE3NTY0NzYyMTJ9.ad3rjqFiaHR5ZMgTvsfgDQVqbOOLMc5nz9OATqmDjW0";

describe("API Integration Test - /change-password", () => {
  const randomPassword = (length = 12) =>
    Array.from({ length }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?".charAt(
        Math.floor(Math.random() * 78)
      )
    ).join("");
  const password = randomPassword(16);
  it("should update password successfully if not same as old password ", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1") // depends on your auth
      .send({
        password,
      });

    expect(res.status).toBe(200);
  });
  it("should fail when new password is the same as old password", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        password,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "you can not use same password as old password"
    );
  });
  it("should return 401 when no token is provided", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1");

    expect(res.status).toBe(401);
  });

  it("should return 403 for invalid session IP/user-agent", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "FakeAgent/1.0")
      .set("X-Forwarded-For", "1.2.3.4");

    expect(res.statusCode).toBe(403);
  });

  it("Returns 400 if email is missing", async () => {
    const res = await request(app).post("/api/settings/change-password");

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"new" is required'],
    });
  });
});
