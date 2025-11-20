import request from "supertest";
import App from "../../src/app";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = new App().getInstance();

describe("GET /api/auth/github/callback", () => {
  const endpoint = "/api/auth/github/callback";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Logs in successfully when GitHub code is valid", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "gh_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { name: "Harsh GH", avatar_url: "pic.png" },
      })
      .mockResolvedValueOnce({
        data: [{ email: "harshgithub@example.com", primary: true }],
      });

    const res = await request(app)
      .get(endpoint)
      .query({ code: "f55a8edea2f04e3b88d2" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("Returns 400 if code is missing", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");
    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      message: "code is required",
    });
  });

  it("Returns 400 if GitHub email is not available", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "gh_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { name: "Harsh", avatar_url: "pic.png" },
      })
      .mockResolvedValueOnce({ data: [] });

    const res = await request(app)
      .get(endpoint)
      .query({ code: "f55a8edea2f04e3b88d2" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");
    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      message: "GitHub email not available",
    });
  });

  it("Returns 409 if user exists but not verified", async () => {
    const email = `${Date.now()}@example.com`;

    // Create unverified user

    mockedAxios.post.mockResolvedValue({
      data: { access_token: "gh_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { name: "GH User", avatar_url: "pic.png" },
      })
      .mockResolvedValueOnce({
        data: [{ email: "1763611958192@example.com", primary: true }],
      });

    const res = await request(app)
      .get(endpoint)
      .query({ code: "f55a8edea2f04e3b88d2" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");
    expect(res.statusCode).toBe(409);
    expect(res.body).toStrictEqual({
      message: "email not verified",
    });
  });

  it("Creates a new GitHub user when not found in DB", async () => {
    const email = `${Date.now()}@example.com`;

    mockedAxios.post.mockResolvedValue({
      data: { access_token: "gh_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { name: "New GH User", avatar_url: "ghpic.png" },
      })
      .mockResolvedValueOnce({
        data: [{ email, primary: true }],
      });

    const res = await request(app)
      .get(endpoint)
      .query({ code: "f55a8edea2f04e3b88d2" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("Returns 500 if GitHub OAuth fails", async () => {
    mockedAxios.post.mockRejectedValue(new Error("GitHub failure"));

    const res = await request(app)
      .get(endpoint)
      .query({ code: "invalid-code" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(500);
    expect(res.body).toBe("Internal server error");
  });
});
