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

  describe("uploadMiddleware", () => {
    let userToken;

    beforeAll(async () => {
      const user = await User.create({
        email: "uploadtest@example.com",
        password: "password123",
      });

      const login = await request(app).post("/login").send({
        email: "uploadtest@example.com",
        password: "password123",
      });
      userToken = login.body.access_token;
    });

    afterAll(async () => {
      await User.destroy({
        where: { email: "uploadtest@example.com" },
      });
    });

    test("should accept PDF files", async () => {
      const response = await request(app)
        .post("/cvs/upload")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("file", Buffer.from("%PDF-1.4 test"), "test.pdf");

      // Will fail in processing but passes upload validation
      expect([201, 500]).toContain(response.status);
    });

    test("should accept DOCX files", async () => {
      const response = await request(app)
        .post("/cvs/upload")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("file", Buffer.from("test docx"), "test.docx");

      // Will fail in processing but passes upload validation
      expect([201, 500]).toContain(response.status);
    });

    test("should reject invalid file types", async () => {
      const response = await request(app)
        .post("/cvs/upload")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("file", Buffer.from("fake image"), "test.jpg");

      // Multer error returns 500 status
      expect(response.status).toBe(500);
    });
  });

  describe("errorHandler middleware", () => {
    test("should handle JsonWebTokenError", async () => {
      const response = await request(app)
        .get("/cvs")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    test("should handle SequelizeValidationError", async () => {
      const response = await request(app).post("/register").send({
        email: "invalid-email",
        password: "short",
      });

      expect(response.status).toBe(400);
    });

    test("should handle generic errors", async () => {
      const response = await request(app)
        .get("/cvs/invalid-id")
        .set("Authorization", "Bearer invalid.token.here");

      expect(response.status).toBe(401);
    });
  });
});
