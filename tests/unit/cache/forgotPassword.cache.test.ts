// 👈 FIRST LINE IN FILE
jest.mock("../../../src/redis/client", () => {
  return {
    redisClient: {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      on: jest.fn(), // prevents "connected to redis" logs
    },
  };
});

import { ForgotPasswordTokenCache } from "../../../src/cache/forgotPassword.cache";
import { redisClient } from "../../../src/redis/client";

describe("ForgotPasswordTokenCache", () => {
  const cache = new ForgotPasswordTokenCache();
  const userId = "user-123";
  const token = "secure-token-xyz";

  it("should set token with TTL", async () => {
    (redisClient.set as jest.Mock).mockResolvedValue("OK");

    await cache.createToken(userId, token, 600);

    expect(redisClient.set).toHaveBeenCalledWith(
      `forgot:${token}`,
      userId,
      "EX",
      600
    );
  });
});
