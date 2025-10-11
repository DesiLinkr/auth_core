import { AbstractTokenCache } from "./abstract.token.cache";

export class SecureTokenCache extends AbstractTokenCache {
  protected prefix = "secure";
  public createToken = async (
    identifier: string,
    token: string,
    TTL_SECONDS: number
  ): Promise<void> => {
    await this.setToken(identifier, token, TTL_SECONDS);
  };
}
