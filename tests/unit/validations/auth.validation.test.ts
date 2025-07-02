import { AuthValidation } from "../../../src/validations/auth.validation";

describe("AuthValidation", () => {
  describe("forgotPassword schema", () => {
    it("should pass for a valid email", () => {
      const input = { email: "valid@example.com" };
      const { error } = AuthValidation.forgotPassword.validate(input);
      expect(error).toBeUndefined();
    });

    it("should fail when email is missing", () => {
      const input = {};
      const { error } = AuthValidation.forgotPassword.validate(input);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toMatch(/email.*required/i);
    });

    it("should fail when email is not valid", () => {
      const input = { email: "notanemail" };
      const { error } = AuthValidation.forgotPassword.validate(input);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toMatch(/email.*valid/i);
    });
  });

  describe("register schema", () => {
    it("should pass for valid input", () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        name: "Harsh Dev",
      };
      const { error } = AuthValidation.register.validate(input);
      expect(error).toBeUndefined();
    });

    it("should fail if name is too short", () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        name: "Joe",
      };
      const { error } = AuthValidation.register.validate(input);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toMatch(/name.*length/i);
    });

    it("should fail if password is too short", () => {
      const input = {
        email: "test@example.com",
        password: "123",
        name: "Valid Name",
      };
      const { error } = AuthValidation.register.validate(input);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toMatch(/password.*length/i);
    });

    it("should fail if email is invalid", () => {
      const input = {
        email: "invalid-email",
        password: "password123",
        name: "Valid Name",
      };
      const { error } = AuthValidation.register.validate(input);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toMatch(/email.*valid/i);
    });
  });
});
