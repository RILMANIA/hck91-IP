// Unit tests for helper functions (not mocked)
const { test, expect, describe } = require("@jest/globals");

// Set JWT_SECRET before importing jwt helpers
process.env.JWT_SECRET = "test-secret-key-for-jwt";

describe("Helper Function Unit Tests", () => {
  describe("bcrypt helper", () => {
    const { hashPassword, comparePassword } = require("../helpers/bcrypt");

    test("should hash passwords with different salts", async () => {
      const password = "testpass123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toMatch(/^\$2b\$/);
    });

    test("should compare password with hash correctly", async () => {
      const password = "correctpassword";
      const hash = await hashPassword(password);

      const isValid = await comparePassword(password, hash);
      const isInvalid = await comparePassword("wrongpassword", hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe("JWT helper", () => {
    const { signToken, verifyToken } = require("../helpers/jwt");

    test("should create and verify JWT tokens", () => {
      const payload = { id: 123, email: "test@example.com" };
      const token = signToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    test("should throw error for invalid tokens", () => {
      expect(() => {
        verifyToken("invalid.token.here");
      }).toThrow();
    });

    test("should throw error for malformed tokens", () => {
      expect(() => {
        verifyToken("notavalidtoken");
      }).toThrow();
    });
  });
});
