// Mock external services BEFORE any imports
jest.mock("../helpers/cloudinaryService");
jest.mock("../helpers/geminiService");
jest.mock("../helpers/textExtractor");

const request = require("supertest");
const {
  test,
  expect,
  beforeAll,
  afterAll,
  describe,
} = require("@jest/globals");

const app = require("../app");
const { User, Cv } = require("../models");
const path = require("path");
const fs = require("fs");

const { uploadToCloudinary } = require("../helpers/cloudinaryService");
const { generateCVFromText } = require("../helpers/geminiService");
const { extractTextFromFile } = require("../helpers/textExtractor");

beforeAll(async () => {
  // Setup before tests run - seed database with users
  const userData = [
    {
      email: "user1@example.com",
      password: "password123",
    },
    {
      email: "user2@example.com",
      password: "password456",
    },
  ];
  await User.bulkCreate(userData, { individualHooks: true });

  // Create test CVs
  const users = await User.findAll();
  const cvData = [
    {
      userId: users[0].id,
      original_file_url: "http://example.com/cv1.pdf",
      generated_cv: {
        name: "John Doe",
        email: "john@example.com",
        education: [{ degree: "Bachelor", institution: "University A" }],
        experience: [{ title: "Developer", company: "Company A" }],
        skills: ["JavaScript", "Node.js"],
      },
    },
    {
      userId: users[1].id,
      original_file_url: "http://example.com/cv2.pdf",
      generated_cv: {
        name: "Jane Smith",
        email: "jane@example.com",
        education: [{ degree: "Master", institution: "University B" }],
        experience: [{ title: "Designer", company: "Company B" }],
        skills: ["Figma", "Adobe XD"],
      },
    },
  ];
  await Cv.bulkCreate(cvData);
});

afterAll(async () => {
  // Teardown after tests finish - clean up test data
  await Cv.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await User.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  console.log("Test data cleaned up");
});

describe("GET /cvs endpoint", () => {
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    // Login as user1
    const loginRes1 = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "password123",
    });
    user1Token = loginRes1.body.access_token;

    // Login as user2
    const loginRes2 = await request(app).post("/login").send({
      email: "user2@example.com",
      password: "password456",
    });
    user2Token = loginRes2.body.access_token;
  });

  test("should get user's CVs successfully", async () => {
    const response = await request(app)
      .get("/cvs")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("id", expect.any(Number));
    expect(response.body[0]).toHaveProperty("userId", expect.any(Number));
    expect(response.body[0]).toHaveProperty(
      "original_file_url",
      expect.any(String),
    );
    expect(response.body[0]).toHaveProperty("generated_cv", expect.any(Object));
  });

  test("should fail if not logged in", async () => {
    const response = await request(app).get("/cvs");

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("should fail if token is invalid", async () => {
    const response = await request(app)
      .get("/cvs")
      .set("Authorization", `Bearer invalid.token.here`);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should only return CVs belonging to the authenticated user", async () => {
    const response1 = await request(app)
      .get("/cvs")
      .set("Authorization", `Bearer ${user1Token}`);

    const response2 = await request(app)
      .get("/cvs")
      .set("Authorization", `Bearer ${user2Token}`);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // Check that each user only gets their own CVs
    const user1Cvs = response1.body;
    const user2Cvs = response2.body;

    expect(user1Cvs.every((cv) => cv.generated_cv.name === "John Doe")).toBe(
      true,
    );
    expect(user2Cvs.every((cv) => cv.generated_cv.name === "Jane Smith")).toBe(
      true,
    );
  });
});

describe("GET /cvs/:id endpoint", () => {
  let user1Token;
  let user2Token;
  let cv1Id;
  let cv2Id;

  beforeAll(async () => {
    // Login as user1
    const loginRes1 = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "password123",
    });
    user1Token = loginRes1.body.access_token;

    // Login as user2
    const loginRes2 = await request(app).post("/login").send({
      email: "user2@example.com",
      password: "password456",
    });
    user2Token = loginRes2.body.access_token;

    // Get CV IDs
    const users = await User.findAll();
    const cv1 = await Cv.findOne({ where: { userId: users[0].id } });
    const cv2 = await Cv.findOne({ where: { userId: users[1].id } });
    cv1Id = cv1.id;
    cv2Id = cv2.id;
  });

  test("should get CV by id successfully", async () => {
    const response = await request(app)
      .get(`/cvs/${cv1Id}`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("id", cv1Id);
    expect(response.body).toHaveProperty("userId", expect.any(Number));
    expect(response.body).toHaveProperty(
      "original_file_url",
      expect.any(String),
    );
    expect(response.body).toHaveProperty("generated_cv", expect.any(Object));
  });

  test("should fail if not logged in", async () => {
    const response = await request(app).get(`/cvs/${cv1Id}`);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("should fail if token is invalid", async () => {
    const response = await request(app)
      .get(`/cvs/${cv1Id}`)
      .set("Authorization", `Bearer invalid.token.here`);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if CV id does not exist", async () => {
    const response = await request(app)
      .get("/cvs/99999999")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });
});

describe("PUT /cvs/:id endpoint", () => {
  let user1Token;
  let user2Token;
  let cv1Id;
  let cv2Id;

  beforeAll(async () => {
    // Login as user1
    const loginRes1 = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "password123",
    });
    user1Token = loginRes1.body.access_token;

    // Login as user2
    const loginRes2 = await request(app).post("/login").send({
      email: "user2@example.com",
      password: "password456",
    });
    user2Token = loginRes2.body.access_token;

    // Get CV IDs
    const users = await User.findAll();
    const cv1 = await Cv.findOne({ where: { userId: users[0].id } });
    const cv2 = await Cv.findOne({ where: { userId: users[1].id } });
    cv1Id = cv1.id;
    cv2Id = cv2.id;
  });

  test("should update CV successfully", async () => {
    const updatedCV = {
      name: "John Doe Updated",
      email: "john.updated@example.com",
      education: [{ degree: "Master", institution: "University A" }],
      experience: [{ title: "Senior Developer", company: "Company A" }],
      skills: ["JavaScript", "Node.js", "React"],
    };

    const response = await request(app)
      .put(`/cvs/${cv1Id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ generated_cv: updatedCV });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("id", cv1Id);
    expect(response.body).toHaveProperty("generated_cv");
    expect(response.body.generated_cv).toHaveProperty(
      "name",
      "John Doe Updated",
    );
  });

  test("should fail if not logged in", async () => {
    const response = await request(app)
      .put(`/cvs/${cv1Id}`)
      .send({ generated_cv: { name: "Should Fail" } });

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("should fail if token is invalid", async () => {
    const response = await request(app)
      .put(`/cvs/${cv1Id}`)
      .set("Authorization", `Bearer invalid.token.here`)
      .send({ generated_cv: { name: "Should Fail" } });

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if CV id does not exist", async () => {
    const response = await request(app)
      .put("/cvs/99999999")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ generated_cv: { name: "No CV" } });

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail when user tries to update CV they don't own", async () => {
    const response = await request(app)
      .put(`/cvs/${cv2Id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ generated_cv: { name: "Unauthorized Update" } });

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });
});

describe("DELETE /cvs/:id endpoint", () => {
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    // Login as user1
    const loginRes1 = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "password123",
    });
    user1Token = loginRes1.body.access_token;

    // Login as user2
    const loginRes2 = await request(app).post("/login").send({
      email: "user2@example.com",
      password: "password456",
    });
    user2Token = loginRes2.body.access_token;
  });

  test("should delete CV successfully", async () => {
    // Create a new CV to delete
    const users = await User.findAll();
    const newCv = await Cv.create({
      userId: users[0].id,
      original_file_url: "http://example.com/todelete.pdf",
      generated_cv: { name: "To Delete", email: "delete@example.com" },
    });

    const response = await request(app)
      .delete(`/cvs/${newCv.id}`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if not logged in", async () => {
    const users = await User.findAll();
    const newCv = await Cv.create({
      userId: users[0].id,
      original_file_url: "http://example.com/noauth.pdf",
      generated_cv: { name: "No Auth", email: "noauth@example.com" },
    });

    const response = await request(app).delete(`/cvs/${newCv.id}`);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  test("should fail if token is invalid", async () => {
    const users = await User.findAll();
    const newCv = await Cv.create({
      userId: users[0].id,
      original_file_url: "http://example.com/badtoken.pdf",
      generated_cv: { name: "Bad Token", email: "badtoken@example.com" },
    });

    const response = await request(app)
      .delete(`/cvs/${newCv.id}`)
      .set("Authorization", `Bearer invalid.token.here`);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if CV does not exist", async () => {
    const response = await request(app)
      .delete("/cvs/99999999")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail when user tries to delete CV they don't own", async () => {
    // Create CV owned by user2
    const users = await User.findAll();
    const user2Cv = await Cv.create({
      userId: users[1].id,
      original_file_url: "http://example.com/user2cv.pdf",
      generated_cv: { name: "User 2 CV", email: "user2@example.com" },
    });

    // Try to delete with user1 token
    const response = await request(app)
      .delete(`/cvs/${user2Cv.id}`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });
});

describe("POST /cvs/upload endpoint", () => {
  let userToken;

  beforeAll(async () => {
    const loginRes = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "password123",
    });
    userToken = loginRes.body.access_token;

    // Setup mocks
    uploadToCloudinary.mockResolvedValue({
      secure_url: "https://cloudinary.com/uploaded-cv.pdf",
    });

    extractTextFromFile.mockResolvedValue(
      "John Doe\njohn@example.com\n+1234567890\n\nEducation:\nBachelor of Computer Science\n\nExperience:\nSoftware Developer at Tech Corp",
    );

    generateCVFromText.mockResolvedValue({
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      education: [
        {
          institution: "University",
          degree: "Bachelor of Computer Science",
          year: "2020",
        },
      ],
      experience: [
        {
          company: "Tech Corp",
          position: "Software Developer",
          duration: "2020-2023",
          description: "Developed web applications",
        },
      ],
      skills: ["JavaScript", "Node.js", "React"],
    });
  });

  test("should upload CV successfully", async () => {
    const response = await request(app)
      .post("/cvs/upload")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("file", Buffer.from("%PDF-1.4 test content"), "test-cv.pdf");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("original_file_url");
    expect(response.body).toHaveProperty("generated_cv");
    expect(uploadToCloudinary).toHaveBeenCalled();
    expect(extractTextFromFile).toHaveBeenCalled();
    expect(generateCVFromText).toHaveBeenCalled();
  });

  test("should fail when no file is uploaded", async () => {
    const response = await request(app)
      .post("/cvs/upload")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if not authenticated", async () => {
    const response = await request(app)
      .post("/cvs/upload")
      .attach("file", Buffer.from("test"), "test.pdf");

    expect(response.status).toBe(401);
  });

  test("should handle cloudinary upload errors", async () => {
    uploadToCloudinary.mockRejectedValueOnce(
      new Error("Cloudinary upload failed"),
    );

    const response = await request(app)
      .post("/cvs/upload")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("file", Buffer.from("test"), "test.pdf");

    expect(response.status).toBe(500);
  });

  test("should handle text extraction errors", async () => {
    uploadToCloudinary.mockResolvedValueOnce({
      secure_url: "https://cloudinary.com/test.pdf",
    });
    extractTextFromFile.mockRejectedValueOnce(
      new Error("Text extraction failed"),
    );

    const response = await request(app)
      .post("/cvs/upload")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("file", Buffer.from("test"), "test.pdf");

    expect(response.status).toBe(500);
  });

  test("should handle Gemini AI errors", async () => {
    uploadToCloudinary.mockResolvedValueOnce({
      secure_url: "https://cloudinary.com/test.pdf",
    });
    extractTextFromFile.mockResolvedValueOnce("Test CV text");
    generateCVFromText.mockRejectedValueOnce(
      new Error("Gemini generation failed"),
    );

    const response = await request(app)
      .post("/cvs/upload")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("file", Buffer.from("test"), "test.pdf");

    expect(response.status).toBe(500);
  });
});

describe("PUT /cvs/:id - Missing CV content", () => {
  let userToken;
  let cvId;

  beforeAll(async () => {
    const loginRes = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "password123",
    });
    userToken = loginRes.body.access_token;

    const users = await User.findAll();
    const cv = await Cv.findOne({ where: { userId: users[0].id } });
    cvId = cv.id;
  });

  test("should fail when generated_cv is not provided", async () => {
    const response = await request(app)
      .put(`/cvs/${cvId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "No CV content provided");
  });
});
