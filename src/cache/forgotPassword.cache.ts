import { AbstractTokenCache } from "./abstract.token.cache";

export class ForgotPasswordTokenCache extends AbstractTokenCache {
  protected prefix = "forgot";
  private readonly TTL_SECONDS = 900; // 15 mint
  public createToken = async (
    identifier: string,
    token: string,
    TTL_SECONDS: number
  ): Promise<void> => {
    await this.setToken(token, identifier, TTL_SECONDS);
  };

  public isvaildToken = async (forgotToken: string) => {
    const token = await this.getToken(forgotToken);
    return token ? true : false;
  };
}
