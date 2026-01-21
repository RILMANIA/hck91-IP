const {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { User, Cv } = require("../models");

describe("Middleware Tests", () => {
  describe("authenticate middleware", () => {
    test("should fail without authorization header", async () => {
      const response = await request(app).get("/cvs");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    test("should fail with invalid token format", async () => {
      const response = await request(app)
        .get("/cvs")
        .set("Authorization", "InvalidTokenFormat");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("matchUser middleware", () => {
    let user1Token, user2Token, user1Cv;

    beforeAll(async () => {
      const user1 = await User.create({
        email: "matchuser1@example.com",
        password: "password123",
      });
      const user2 = await User.create({
        email: "matchuser2@example.com",
        password: "password123",
      });

      user1Cv = await Cv.create({
        userId: user1.id,
        original_file_url: "http://example.com/test.pdf",
        generated_cv: { name: "Test User" },
      });

      const login1 = await request(app).post("/login").send({
        email: "matchuser1@example.com",
        password: "password123",
      });
      user1Token = login1.body.access_token;

      const login2 = await request(app).post("/login").send({
        email: "matchuser2@example.com",
        password: "password123",
      });
      user2Token = login2.body.access_token;
    });

    afterAll(async () => {
      await Cv.destroy({ where: {} });
      await User.destroy({
        where: {
          email: ["matchuser1@example.com", "matchuser2@example.com"],
        },
      });
    });

    test("should allow owner to access their CV", async () => {
      const response = await request(app)
        .get(`/cvs/${user1Cv.id}`)
        .set("Authorization", `Bearer ${user1Token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", user1Cv.id);
    });

    test("should prevent other users from updating CV", async () => {
      const response = await request(app)
        .put(`/cvs/${user1Cv.id}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ generated_cv: { name: "Hacker" } });
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Access denied");
    });

    test("should prevent other users from deleting CV", async () => {
      const response = await request(app)
        .delete(`/cvs/${user1Cv.id}`)
        .set("Authorization", `Bearer ${user2Token}`);
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Access denied");
    });
  });
});
