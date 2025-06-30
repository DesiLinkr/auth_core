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
        const primaryEmail = existing.emails?.find((e: any) => e.isPrimary);
        const isVerified = primaryEmail?.isVerified ?? false;

        if (!isVerified) {
          throw new Error("User already exists but not verified");
        }
        throw new Error("User already exists");
      }
      const hashPassword = await this.Hasher.Password(rawPassword);
      const userData = await this.AuthRepo.createUser(
        email,
        name,
        hashPassword
      );
      if (userData) {
        // add email logic here in future
      }
      if (!userData) {
        throw new Error("User registration failed");
      }

      const { password, ...safeUser } = userData;

      return safeUser;
    } catch (error: any) {
      throw new Error(error.message || "Internal server error");
    }
  };
}
