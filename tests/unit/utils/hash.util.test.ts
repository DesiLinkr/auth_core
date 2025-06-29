import { Hasher } from "../../../src/utils/hash.util";

describe("Hasher Utility", () => {
  const hasher = new Hasher();
  const password = "securePassword123";
  let hashedPassword: string;

  it("should hash the password", async () => {
    hashedPassword = await hasher.Password(password);
    expect(typeof hashedPassword).toBe("string");
    expect(hashedPassword).not.toBe(password);
  });

  it("should compare password correctly", async () => {
    const isMatch = await hasher.comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });
  it("should return false for incorrect password", async () => {
    const result = await hasher.comparePassword(
      "wrongPassword",
      hashedPassword
    );
    expect(result).toBe(false);
  });
});
