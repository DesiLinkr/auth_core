import request from "supertest";
import App from "../../src/app";

const app = new App().getInstance();

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmE5ZGVlNjQtNzRmNi00ZWY0LWFiZDQtNWY2NmMyNTVlNWQ4Iiwic2Vzc2lvbl9pZCI6MTI4LCJpYXQiOjE3NTY0NzYyMTJ9.ad3rjqFiaHR5ZMgTvsfgDQVqbOOLMc5nz9OATqmDjW0";

describe("API Integration Test - /settings/change-primary-email", () => {
  it("should return 403 if email does not exist", async () => {
    const res = await request(app)
      .post("/api/settings/change-primary-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "missing@example.com",
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "email does not exits",
    });
  });

  it("should return 403 if email is already primary", async () => {
    const res = await request(app)
      .post("/api/settings/change-primary-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "test@example.com",
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "this email is allready Primary",
    });
  });

  it("should return 200 if primary email changed successfully", async () => {
    const res = await request(app)
      .post("/api/settings/change-primary-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: `test403@example.com`,
      });

    // NOTE: your controller does not send 200 response on success.
    // If updated, check accordingly:
    expect(res.status).toBe(200);

    await request(app)
      .post("/api/settings/change-primary-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: `test@example.com`,
      });
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/settings/change-primary-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.details[0]).toContain('"email" is required');
  });

  it("should return 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/settings/change-primary-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "invalid-email",
      });

    expect(res.status).toBe(400);
    expect(res.body.details[0]).toContain('"email" must be a valid email');
  });

  it("should return 401 if token is not provided", async () => {
    const res = await request(app)
      .post("/api/settings/change-primary-email")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .send({
        email: "unauth@example.com",
      });

    expect(res.status).toBe(401);
  });

  it("should return 403 if user session fingerprint mismatch", async () => {
    const res = await request(app)
      .post("/api/settings/change-primary-email")
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "FakeAgent/9.9")
      .set("x-forwarded-for", "5.5.5.5")
      .send({
        email: "forbidden@example.com",
      });

    expect(res.status).toBe(403);
  });
});
