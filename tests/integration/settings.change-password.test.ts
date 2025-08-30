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
  const newPassword = randomPassword(16);
  const oldPassword = "4Qx{$k6&vRI_Zg*h";
  it("should update password successfully if not same as old password ", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1") // depends on your auth
      .send({
        oldPassword,
        newPassword,
      });

    expect(res.status).toBe(200);
    await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1") // depends on your auth
      .send({
        newPassword: oldPassword,
        oldPassword: newPassword,
      });
  });

  it("should fail when incorrect old password", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1") // depends on your auth
      .send({
        oldPassword: "333eee3322",
        newPassword,
      });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "incorrect password" });
  });

  it("should fail when  old password invaild", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1") // depends on your auth
      .send({
        oldPassword: "3330",
        newPassword,
      });
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"oldPassword" length must be at least 8 characters long'],
    });
  });

  it("should fail when new password is the same as old password", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        oldPassword,
        newPassword: oldPassword,
      });

    expect(res.status).toBe(409);
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

  it("Returns 400 if oldPassword is missing", async () => {
    const res = await request(app)
      .post("/api/settings/change-password")
      .send({ newPassword: "NewPass123n" });

    expect(res.statusCode).toBe(400);

    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"oldPassword" is required'],
    });
  });
});
