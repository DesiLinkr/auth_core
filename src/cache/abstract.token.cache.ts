import Redis from "ioredis";
import { redisClient } from "../redis/client";
export abstract class AbstractTokenCache {
  private readonly redisClient: Redis;
  constructor() {
    this.redisClient = redisClient;
  }
  protected abstract prefix: string;

  private getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  protected setToken = async (
    id: string,
    token: string,
    ttl = 900
  ): Promise<void> => {
    await this.redisClient.set(this.getKey(id), token, "EX", ttl);
  };

  protected getToken = (id: string): Promise<string | null> => {
    return this.redisClient.get(this.getKey(id));
  };

  protected removeToken = (id: string): Promise<number> => {
    return this.redisClient.del(this.getKey(id));
  };
}
