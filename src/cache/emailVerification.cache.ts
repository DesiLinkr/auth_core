import { AbstractTokenCache } from "./abstract.token.cache";

export class EmailVerificationTokenCache extends AbstractTokenCache {
  protected prefix = "verify";
  public createToken = async (
    identifier: string,
    token: string,
    TTL_SECONDS: number
  ): Promise<void> => {
    await this.setToken(identifier, token, TTL_SECONDS);
  };
}
