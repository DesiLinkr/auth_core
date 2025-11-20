import request from "supertest";
import App from "../../src/app";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = new App().getInstance();

describe("POST /api/auth/linkedin/callback", () => {
  const endpoint = "/api/auth/linkedin/callback";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------
  // SUCCESS CASE
  // -----------------------------------------------------------
  it("Logs in successfully when LinkedIn code is valid", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "linkedin_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          localizedFirstName: "Harsh",
          localizedLastName: "Tagra",
          profilePicture: {
            "displayImage~": {
              elements: [
                {
                  identifiers: [
                    { identifier: "https://cdn.linkedin.com/avt1.png" },
                  ],
                },
              ],
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          elements: [
            { "handle~": { emailAddress: "harshlinkedin@example.com" } },
          ],
        },
      });

    const res = await request(app)
      .post(endpoint)
      .send({ code: "123456" }) // body request (POST)
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("refreshToken");
  });

  // -----------------------------------------------------------
  // MISSING CODE
  // -----------------------------------------------------------
  it("Returns 400 if code is missing", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({})
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Validation error",
      details: ['"code" is required'],
    });
  });

  // -----------------------------------------------------------
  // LINKEDIN EMAIL NOT AVAILABLE
  // -----------------------------------------------------------
  it("Returns 400 if LinkedIn email is not available", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "linkedin_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          localizedFirstName: "Harsh",
          localizedLastName: "Tagra",
        },
      })
      .mockResolvedValueOnce({
        data: {
          elements: [
            {
              "handle~": {}, // valid structure but no email → your service returns error safely
            },
          ],
        }, // no email
      });

    const res = await request(app)
      .post(endpoint)
      .send({ code: "ABCDE" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      message: "LinkedIn email not available",
    });
  });

  // -----------------------------------------------------------
  // USER EXISTS BUT NOT VERIFIED
  // -----------------------------------------------------------
  it("Returns 409 if LinkedIn user exists but not verified", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "linkedin_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          localizedFirstName: "User",
          localizedLastName: "Test",
        },
      })
      .mockResolvedValueOnce({
        data: {
          elements: [
            { "handle~": { emailAddress: "1763611958192@example.com" } },
          ],
        },
      });

    const res = await request(app)
      .post(endpoint)
      .send({ code: "443322" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(409);
    expect(res.body).toStrictEqual({
      message: "email not verified",
    });
  });

  // -----------------------------------------------------------
  // NEW USER CREATED
  // -----------------------------------------------------------
  it("Creates a new LinkedIn user when not found in DB", async () => {
    const email = `${Date.now()}@example.com`;

    mockedAxios.post.mockResolvedValue({
      data: { access_token: "linkedin_token" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          localizedFirstName: "Brand",
          localizedLastName: "New",
          profilePicture: {
            "displayImage~": {
              elements: [
                {
                  identifiers: [{ identifier: "https://cdn.li/new.png" }],
                },
              ],
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          elements: [{ "handle~": { emailAddress: email } }],
        },
      });

    const res = await request(app)
      .post(endpoint)
      .send({ code: "NEW123" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("refreshToken");
  });

  // -----------------------------------------------------------
  // LINKEDIN TOKEN FAILURE
  // -----------------------------------------------------------
  it("Returns 500 if LinkedIn OAuth fails", async () => {
    mockedAxios.post.mockRejectedValue(new Error("LinkedIn OAuth failed"));

    const res = await request(app)
      .post(endpoint)
      .send({ code: "failed-code" })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(500);
    expect(res.body).toBe("Internal server error");
  });
});
