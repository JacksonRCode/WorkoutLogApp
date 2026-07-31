const request = require("supertest");
const jwt = require("jsonwebtoken");
import { config } from "../config";
const app = require("../app");
const { setupTestData, endTesting } = require("./testHelper");

beforeAll(async () => {
  await setupTestData();
});

// Test structure:
// 1. Arrange: Choose invalid credentials
// 2. Act: Send request
// 4. Assert: expect certain outcome

const getToken = async () => {
  const loginRequest = await request(app).post("/api/user/login").send({
    email: "test@example.com",
    password: "password123",
  });
  return loginRequest.body.token;
};

// authMiddleware
it("returns 401 status when no token is provided", async () => {
  const response = await request(app).get("/api/programs/");
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Not authorized, no token provided");
});
it("returns 401 status when a bad token is provided", async () => {
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer fake-token`);
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Not authorized, token failed");
});
it("returns 401 status when a good secret lacking a numeric user_id is provided", async () => {
  const token = jwt.sign({ role: "user" }, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });

  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Not authorized, token failed");
});

afterAll(async () => {
  await endTesting();
});
