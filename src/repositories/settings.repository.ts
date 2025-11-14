import { PrismaClient } from "@prisma/client";
import { AuthRepository } from "./auth.repository";

export class settingsRepository {
  private prisma;
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? new PrismaClient(); // fallback to real if none provided
  }

  public changePrimaryEmail = (userId: string, newEmail: string) => {
    return this.prisma.$transaction(async (tx) => {
      const oldPrimary = await tx.email.findFirst({
        where: { userId, isPrimary: true },
      });

      if (!oldPrimary) {
        throw new Error("Primary email not found");
      }

      const newEmailRecord = await tx.email.findFirst({
        where: { userId, email: newEmail },
      });

      if (!newEmailRecord) {
        throw new Error("New email not found ");
      }

      await tx.email.update({
        where: { id: newEmailRecord.id },
        data: { isPrimary: true },
      });
      await tx.email.update({
        where: { id: oldPrimary.id },
        data: { isPrimary: false },
      });
      return { message: "Primary email updated successfully" };
    });
  };
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
  public checkEmailAssociatedWithUserId = async (
    email: string,
    userId: string
  ) => {
    const result = await this.prisma.email.findUnique({
      where: { email, userId },
    });
    return result;
  };

  public removeEmail = async (email: string) => {
    await this.prisma.email.delete({
      where: { email },
    });
  };
}
