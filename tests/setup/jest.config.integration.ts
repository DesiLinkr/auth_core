import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "../..",
  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  setupFiles: ["dotenv/config"], // loads .env.test
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {}], // moved ts-jest config here
  },
};

export default config;
