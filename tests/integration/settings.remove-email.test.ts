import request from "supertest";
import App from "../../src/app";

const app = new App().getInstance();

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmE5ZGVlNjQtNzRmNi00ZWY0LWFiZDQtNWY2NmMyNTVlNWQ4Iiwic2Vzc2lvbl9pZCI6MTI4LCJpYXQiOjE3NTY0NzYyMTJ9.ad3rjqFiaHR5ZMgTvsfgDQVqbOOLMc5nz9OATqmDjW0";

describe("API Integration Test - /remove-email", () => {
  it("should remove an existing non-primary email successfully", async () => {
    const res = await request(app)
      .post("/api/settings/remove-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: `test@example.com`,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/email removed successful/i);
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/settings/remove-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Validation error",
      details: ['"email" is required'],
    });
  });

  it("should return 400 if email format is invalid", async () => {
    const res = await request(app)
      .post("/api/settings/remove-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "invalid-email",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("details");
    expect(res.body.details[0]).toContain('"email" must be a valid email');
  });

  it("should return 403 if email does not exist for user", async () => {
    const res = await request(app)
      .post("/api/settings/remove-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "notfound@example.com",
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message", "email does not exits");
  });

  it("should return 409 if trying to remove primary email", async () => {
    const res = await request(app)
      .post("/api/settings/remove-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "test@example.com",
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty(
      "message",
      "you can not remove primary email"
    );
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app)
      .post("/api/settings/remove-email")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "unauth@example.com",
      });

    expect(res.status).toBe(401);
  });

  it("should return 403 for invalid session IP/user-agent", async () => {
    const res = await request(app)
      .post("/api/settings/remove-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "FakeAgent/1.0")
      .set("x-forwarded-for", "1.2.3.4")
      .send({
        email: "fake403@example.com",
      });

    expect(res.status).toBe(403);
  });
});
