// 👇 Define the mock object
export const mockPrismaObject = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  email: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrismaObject),
}));

// 👇 Now you can safely import PrismaClient after mocking
import { PrismaClient } from "@prisma/client";

// 👇 Export instance that uses mockPrisma
export const mockPrisma = new PrismaClient();
