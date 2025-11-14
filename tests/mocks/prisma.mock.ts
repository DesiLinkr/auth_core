// Define raw mock functions
const emailMock = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const userMock = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
};

export const mockPrismaObject: any = {
  email: emailMock,
  user: userMock,

  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),

  // IMPORTANT — add $transaction mock
  $transaction: jest.fn(),
};

// mock PrismaClient constructor
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrismaObject),
}));

// export instance used across tests
export const mockPrisma = mockPrismaObject;
