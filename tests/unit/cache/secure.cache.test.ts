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

import { SecureTokenCache } from "../../../src/cache/secure.cache";
import { redisClient } from "../../../src/redis/client";

describe("secureTokenCache", () => {
  const cache = new SecureTokenCache();
  const userId = "user-123";
  const token = "secure-token-xyz";

  it("should set token with TTL", async () => {
    (redisClient.set as jest.Mock).mockResolvedValue("OK");

    await cache.createToken(userId, token, 600);

    expect(redisClient.set).toHaveBeenCalledWith(
      `secure:${token}`,
      "user-123",
      "EX",
      600
    );
  });
});
