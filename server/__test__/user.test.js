const request = require("supertest");
const {
  test,
  expect,
  beforeAll,
  afterAll,
  describe,
} = require("@jest/globals");
const app = require("../app");
const { User } = require("../models");

beforeAll(async () => {
  // Setup before tests run - seed database with users
  const userData = [
    {
      email: "testuser@example.com",
      password: "password123",
    },
    {
      email: "admin@example.com",
      password: "admin123",
    },
  ];
  await User.bulkCreate(userData, { individualHooks: true });
});

afterAll(async () => {
  // Teardown after tests finish - clean up test data
  await User.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  console.log("Test data cleaned up");
});

// Mock Google OAuth library
jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: jest.fn().mockImplementation(({ idToken }) => {
          if (idToken === "valid-google-token") {
            return {
              getPayload: () => ({
                email: "googleuser@example.com",
                name: "Google User",
              }),
            };
          }
          throw new Error("Invalid token");
        }),
      };
    }),
  };
});

describe("POST /register endpoint", () => {
  test("should register successfully and return user data", async () => {
    const registerData = {
      email: "newuser@example.com",
      password: "newpass123",
    };

    const response = await request(app).post("/register").send(registerData);

    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("id", expect.any(Number));
    expect(response.body).toHaveProperty("email", "newuser@example.com");
  });

  test("should fail if email is not provided", async () => {
    const registerData = {
      password: "password123",
    };

    const response = await request(app).post("/register").send(registerData);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if password is not provided", async () => {
    const registerData = {
      email: "test@example.com",
    };

    const response = await request(app).post("/register").send(registerData);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if email is invalid format", async () => {
    const registerData = {
      email: "invalidemail",
      password: "password123",
    };

    const response = await request(app).post("/register").send(registerData);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if email already exists", async () => {
    const registerData = {
      email: "testuser@example.com",
      password: "password123",
    };

    const response = await request(app).post("/register").send(registerData);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });
});
describe("POST /auth/google endpoint", () => {
  test("should login with Google successfully and return access_token", async () => {
    const response = await request(app)
      .post("/auth/google")
      .set("token", "valid-google-token");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("access_token", expect.any(String));
  });

  test("should fail if Google token is invalid", async () => {
    const response = await request(app)
      .post("/auth/google")
      .set("token", "invalid-google-token");

    expect(response.status).toBe(500);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should fail if Google token is not provided", async () => {
    const response = await request(app).post("/auth/google");

    expect(response.status).toBe(500);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  test("should create new user if Google email does not exist", async () => {
    const response = await request(app)
      .post("/auth/google")
      .set("token", "valid-google-token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");

    // Verify user was created
    const user = await User.findOne({
      where: { email: "googleuser@example.com" },
    });
    expect(user).toBeTruthy();
    expect(user.email).toBe("googleuser@example.com");
  });

  test("should return token for existing Google user", async () => {
    // First login creates user
    await request(app).post("/auth/google").set("token", "valid-google-token");

    // Second login should return token for existing user
    const response = await request(app)
      .post("/auth/google")
      .set("token", "valid-google-token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
  });
});
describe("POST /login endpoint", () => {
  test("should login successfully and return access_token", async () => {
    const loginData = {
      email: "testuser@example.com",
      password: "password123",
    };

    const response = await request(app).post("/login").send(loginData);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("access_token", expect.any(String));
  });

  test("should fail if email is not provided", async () => {
    const loginData = {
      password: "password123",
    };

    const response = await request(app).post("/login").send(loginData);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  test("should fail if password is not provided", async () => {
    const loginData = {
      email: "testuser@example.com",
    };

    const response = await request(app).post("/login").send(loginData);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message", "Password is required");
  });

  test("should fail if email is not found", async () => {
    const loginData = {
      email: "notfound@example.com",
      password: "somepass",
    };

    const response = await request(app).post("/login").send(loginData);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty(
      "message",
      "Invalid email or password",
    );
  });

  test("should fail if password is incorrect", async () => {
    const loginData = {
      email: "testuser@example.com",
      password: "wrongpassword",
    };

    const response = await request(app).post("/login").send(loginData);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty(
      "message",
      "Invalid email or password",
    );
  });
});
