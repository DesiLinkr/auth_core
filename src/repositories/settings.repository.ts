import { PrismaClient } from "@prisma/client";
import { AuthRepository } from "./auth.repository";

export class settingsRepository {
  private prisma;
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? new PrismaClient(); // fallback to real if none provided
  }
  public setPassword = (userId: string, newPassword: string) => {
    return this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        password: newPassword,
      },
    });
  };
  public addEmailtoUser = async (userId: string, email: string) => {
    return await this.prisma.email.create({
      data: {
        email,
        userId,
        isVerified: false,
        isPrimary: false,
      },
    });
  };
  public findUserInfoById = async (id: string) => {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  };
  public checkEmailexits = async (email: string) => {
    const result = await this.prisma.email.findUnique({
      where: { email },
    });

    return result;
  };
}
