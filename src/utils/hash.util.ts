import bcrypt from "bcrypt";

export class Hasher {
  private bcrypt;
  private saltRounds: number;
  constructor() {
    this.bcrypt = bcrypt;
    this.saltRounds = 12;
  }

  public Password = async (password: string): Promise<string> => {
    try {
      return await this.bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      console.error("❌ Error while hashing password:", error);
      throw new Error("Failed to hash password");
    }
  };

  public comparePassword = async (
    password: string,
    hash: string
  ): Promise<boolean> => {
    try {
      return await this.bcrypt.compare(password, hash);
    } catch (error) {
      console.error("❌ Error while comparing password:", error);
      throw new Error("Failed to compare password");
    }
  };
}
