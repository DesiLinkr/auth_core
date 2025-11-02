import { AbstractTokenCache } from "./abstract.token.cache";

export class ForgotPasswordTokenCache extends AbstractTokenCache {
  protected prefix = "forgot";
  private readonly TTL_SECONDS = 900; // 15 mint
  public createToken = async (
    id: string,
    token: string,
    TTL_SECONDS: number
  ): Promise<void> => {
    await this.setToken(token, id, TTL_SECONDS);
  };

  public isvaildToken = async (forgotToken: string) => {
    const token = await this.getToken(forgotToken);
    return token ? true : false;
  };

  public deleteToken = async (forgotToken: string) => {
    await this.removeToken(forgotToken);
  };
  public getUserIdfromToken = async (forgotToken: string) => {
    const userId = await this.getToken(forgotToken);
    return userId;
  };
  
}
