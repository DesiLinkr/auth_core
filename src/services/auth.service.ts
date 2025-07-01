import { PrismaClient } from "@prisma/client";
import { AuthRepository } from "../repositories/auth.repository";
import { Hasher } from "../utils/hash.util";

export class AuthService {
  private readonly AuthRepo: AuthRepository;
  private readonly Hasher: Hasher;
  constructor(authRepo?: AuthRepository) {
    this.AuthRepo = authRepo ?? new AuthRepository();
    this.Hasher = new Hasher();
  }

  public register = async (
    name: string,
    email: string,
    rawPassword: string
  ) => {
    try {
      const existing: any = await this.AuthRepo.findByEmail(email);

      if (existing) {
        const isVerified = existing.isVerified;

        if (!isVerified) {
          return {
            error: "User already exists but not verified",
            status: 409,
          };
        }
        return { error: "User already exists", status: 409 };
      }
      const hashPassword = await this.Hasher.Password(rawPassword);
      const userData = await this.AuthRepo.createUser(
        email,
        name,
        hashPassword
      );
      if (!userData) {
        return { error: "User registration failed", status: 422 };
      }
      // add email logic here in future

      const { password, ...safeUser } = userData;

      return safeUser;
    } catch (error: any) {
      throw new Error(error.message || "Internal server error");
    }
  };
}
