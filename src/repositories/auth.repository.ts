import { Email, PrismaClient, User } from "@prisma/client";
type EmailWithUser = Email & { user: Pick<User, "id" | "name"> };

export class AuthRepository {
  private prisma;
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? new PrismaClient(); // fallback to real if none provided
  }

  public findByEmail = async (email: string): Promise<EmailWithUser | null> => {
    return await this.prisma.email.findUnique({
      where: { email },
      include: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  };
  public createUser = (
    email: string,
    name: string,
    password: string,
    profileImage?: string
  ): Promise<User | null> => {
    return this.prisma.user.create({
      data: {
        profileImage,
        name,
        password,
        emails: {
          create: {
            email,
            isPrimary: true,
            isVerified: false,
          },
        },
      },

      include: {
        emails: true, // optional: if you want to return created email(s)
      },
    });
  };
}
