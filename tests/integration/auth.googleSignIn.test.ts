import request from "supertest";
import App from "../../src/app";

const app = new App().getInstance();

describe("POST /api/auth/google (NO MOCKS, NO VALIDATION CASES)", () => {
  // ---------------------------------------------
  // SUCCESS CASE (SERVICE MUST SUPPORT TEST TOKEN)
  // ---------------------------------------------
  it("Returns 200 & sessionId for valid Google credential", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({
        credential:
          "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1NzMzYmJiZDgxOGFhNWRiMTk1MTk5Y2Q1NjhlNWQ2ODUxMzJkM2YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NTAwMTEyMzY0NS1iZ2M4N2o0OG03OTl0ZTJzdjJudGw2c2dlcDU5Y2o0ZS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6Ijc1MDAxMTIzNjQ1LWJnYzg3ajQ4bTc5OXRlMnN2Mm50bDZzZ2VwNTljajRlLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA0MDYyMDU4MTIwNjQyMjQ0ODc3IiwiZW1haWwiOiJtcmRhcmszNjY0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3NjM1MjQyMTgsIm5hbWUiOiJNciBkYXJrIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lNY3ZxYkFkQnl5ZDNHN3dINGVQaHM3MTBRQVFQemdqbkoydlFMdERxdFQ2c25IQT1zOTYtYyIsImdpdmVuX25hbWUiOiJNciIsImZhbWlseV9uYW1lIjoiZGFyayIsImlhdCI6MTc2MzUyNDUxOCwiZXhwIjoxNzYzNTI4MTE4LCJqdGkiOiJjYjcyYWM3ZWYxYmZiNmQ5ZjI2N2I4OTAyNDJlY2Y4OTAzMGU1YWEzIn0.FRuen21dg5kd6wvR7FZ7SabfzYDE4kkSZMPR3S9DX7kEd2iAPPV_7fPwVV6GWMETeLRNGLLZbOvbMWFGmHhv5pmit3JYCwU7jr0NDzgObaIk9g_8IyYssnibQh3U49PoqbWBzdtaMXzlg1jr5IyAWexFa2RYkMdpvXZRJwnbFnCxiBcBVbihTZyMZ_zERSoimtEQd-eQZkLPxzaTCq4iGQJCNA21PietPZD0RVR18eJWtvlXnngUGG04yQeh3xeu5sH8xv2ZfHC1G34FtyFh4Z9Cf1JtXbhDAgGLijyuO_TZ15JUPn9nU8_zS5Fst4tBHrO3bMPc9-9PEkFZlxGQbA",
      }) // your service must interpret this
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("refreshToken");
  });

  // ---------------------------------------------
  // EMAIL EXISTS IN DB BUT NOT VERIFIED
  // ---------------------------------------------
  it("Returns 409 when DB email exists but is not verified", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({
        credential:
          "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1NzMzYmJiZDgxOGFhNWRiMTk1MTk5Y2Q1NjhlNWQ2ODUxMzJkM2YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NTAwMTEyMzY0NS1iZ2M4N2o0OG03OTl0ZTJzdjJudGw2c2dlcDU5Y2o0ZS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6Ijc1MDAxMTIzNjQ1LWJnYzg3ajQ4bTc5OXRlMnN2Mm50bDZzZ2VwNTljajRlLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEyNTk5NTA3MjQ1MzM2MDYwMzg0IiwiZW1haWwiOiJoYXJzaHRhZ3JhOTA1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3NjM1MjQwNDgsIm5hbWUiOiJIYXJzaCBUYWdyYSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLWi1mZmZ5RkJ6V2pLYU5lTTltb1oxVGwtbG9rQ1BNZGsxNzBraUdLYXZoMVdBWUlmZT1zOTYtYyIsImdpdmVuX25hbWUiOiJIYXJzaCIsImZhbWlseV9uYW1lIjoiVGFncmEiLCJpYXQiOjE3NjM1MjQzNDgsImV4cCI6MTc2MzUyNzk0OCwianRpIjoiNDgxMWU2ZjI4NTA4OGZiYTQ4N2FiYjM5NTVmYjRhZmRmODAzYzk0OSJ9.gVObqp4Exi2C4kL3HRUXPFRxDdhO-siQuRWBLlJSZsxe0otpNrcq1KINnLZdQHHkP0bXxkk7ROl7bC93dy3mOz2NKm0Ba15_-Z0w_4XltT2xY_9iwNnE2h0hQHSyDv8IQ76MtgnKdgX7GmMNgO0JJC0fRvIxilfbWC2mvmEWCYHl8jiN30i4EzWYIwvCrDF2X3GU4WZTIlli5Xc8lr6bXYQajqSBVX85l5O5ghD1P4qlyQ_lB8b6uBrkUXA39H6rZfOoQBViAPbtiEV4jtOeGlm7GCLTm2uZXMyueizi1gV6A59FFlIvTnEqdqY3zbE9d2sNi2pKU8GTxebUhjb_Fw",
      })
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      message: "email not verified",
    });
  });

  // ---------------------------------------------
  // INTERNAL ERROR
  // ---------------------------------------------
  it("Returns 500 when an internal error occurs", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "TEST_CRASH" }) // trigger internal error
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual("Internal server error");
  });
});
