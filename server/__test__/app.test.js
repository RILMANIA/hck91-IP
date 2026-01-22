const request = require("supertest");
const { test, expect, describe } = require("@jest/globals");
const app = require("../app");

describe("App endpoints", () => {
  describe("GET / endpoint", () => {
    test("should return API message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.text).toBe("Smart CV Assistant API");
    });
  });

  describe("GET /health endpoint", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty(
        "message",
        "Smart CV Assistant API is running",
      );
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("Non-existent routes", () => {
    test("should return 401 for protected unknown routes", async () => {
      const response = await request(app).get("/nonexistent-route");

      // Protected routes without auth return 401
      expect(response.status).toBe(401);
    });
  });
});
