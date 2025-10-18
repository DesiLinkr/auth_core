import { AbstractTokenCache } from "./abstract.token.cache";

export class SecureTokenCache extends AbstractTokenCache {
  protected prefix = "secure";
  public createToken = async (
    id: string,
    token: string,
    TTL_SECONDS: number
  ): Promise<void> => {
    await this.setToken(token, id, TTL_SECONDS);
  };

  public isvaildToken = async (secureToken: string) => {
    const token = await this.getToken(secureToken);
    return token ? true : false;
  };
}
