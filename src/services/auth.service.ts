import { PrismaClient } from "@prisma/client";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
  private readonly AuthRepo: AuthRepository;
  constructor(authRepo?: AuthRepository) {
    this.AuthRepo = authRepo ?? new AuthRepository();
  }

  public register = async (name: string, email: string, password: string) => {
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
      const userData = await this.AuthRepo.createUser(email, name, password);
      if (userData) {
        // add email logic here in future
      }
      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Internal server error");
    }
  };
}
