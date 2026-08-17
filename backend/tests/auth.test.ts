import request from "supertest";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { app } from "../app";
import { setupTestData, endTesting } from "./testHelper";
import { issueAccessToken, verifyAccessToken } from "../auth/accessToken";

beforeAll(async () => {
  await setupTestData();
});

// Tests to do:

// Happy
it("returns 200 on successful program retrieval", async () => {
  const token = issueAccessToken(500);
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(200);
});

it("returns valid token on signup and login", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "Black",
    l_name: "Tea",
    email: "notchamatcha@tea.ca",
    password: "cantsaybudday",
  });
  expect(response.status).toBe(201);
  expect(() => verifyAccessToken(response.body.token)).not.toThrow();

  const loginResponse = await request(app).post("/api/user/login").send({
    email: "notchamatcha@tea.ca",
    password: "cantsaybudday",
  });
  expect(loginResponse.status).toBe(200);
  expect(() => verifyAccessToken(loginResponse.body.token)).not.toThrow();
});

// Sad

it("returns 401 status when a good secret lacking a numeric user_id is provided", async () => {
  const token = jwt.sign({ role: "user" }, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });

  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid access token");
});

it("returns 401 when no token is provided", async () => {
  const response = await request(app).get("/api/programs/");
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Access token required");
});

it("returns 401 when a malformed access token is provided", async () => {
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer fake-token`);
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid access token");
});

it("returns 401 when missing token", async () => {
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer`);

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid access token");
});

it("returns 401 when authorization header includes extra text", async () => {
  const token = issueAccessToken(400);
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer ${token} suspicious-text`);

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid access token");
});

it("returns 401 when authorization header is whitespace", async () => {
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `     `);

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid access token");
});

it("returns 401 when authorization header includes extra text", async () => {
  const token = issueAccessToken(400);
  const malToken = "suspicious" + token;
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer ${malToken}`);

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid access token");
});

it("returns 401 when the wrong authorization type is used", async () => {
  const response = await request(app)
    .get("/api/programs")
    .set("Authorization", "Basic username:password");
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid access token");
});

afterAll(async () => {
  await endTesting();
});
