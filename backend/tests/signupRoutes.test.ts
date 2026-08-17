import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../app";
import { issueAccessToken } from "../auth/accessToken";
import { config } from "../config";
import { setupTestData, endTesting } from "./testHelper";

beforeAll(async () => {
  await setupTestData();
});

// signupUser
it("returns 201 with a successful signup", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "Rocky",
    l_name: "TheAlien",
    email: "notyetused@email.com",
    password: "SuperFake",
  });
  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Successfully created user");
});

it("returns 409 when email is already in use", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "Rocky",
    l_name: "TheAlien",
    email: "notyetused@email.com",
    password: "SuperFake",
  });
  expect(response.status).toBe(409);
  expect(response.body.message).toBe("Email already in use");
});

// loginUser
it("returns 200 when user successfully logs in", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "notyetused@email.com",
    password: "SuperFake",
  });
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Login successful");
});

it("returns 401 when the login credentials are invalid", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "fake_email_123@example.com",
    password: "incorrect_password",
  });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid email or password");
});

it("returns exact same as above when email is correct and password incorrect", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "notyetused@email.com",
    password: "fake_password",
  });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid email or password");
});

// getMe
it("returns 200 when a user is successfully retrieved", async () => {
  const loginRequest = await request(app).post("/api/user/login").send({
    email: "test@example.com",
    password: "password123",
  });
  const token = loginRequest.body.token;

  const response = await request(app)
    .get("/api/user/me")
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("User found");
});

it("returns 404 if user_id not found", async () => {
  const token = issueAccessToken(999);
  const response = await request(app)
    .get("/api/user/me")
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(404);
  expect(response.body.message).toBe("User not found");
});

// zod testing
// signup
// first name
it("returns 400 status and missing first name response", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "",
    l_name: "LName",
    email: "valid@email.com",
    password: "FakePassword",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "f_name",
    message: "First name is required",
  });
});
it("returns 400 status and missing first name response for whitespace first name", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: " ",
    l_name: "LName",
    email: "valid@email.com",
    password: "FakePassword",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "f_name",
    message: "First name is required",
  });
});
// last name
it("returns 400 status and missing last name response", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "FName",
    l_name: "",
    email: "valid@email.com",
    password: "FakePassword",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "l_name",
    message: "Last name is required",
  });
});
it("returns 400 status and missing last name response for whitespace last name", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "FName",
    l_name: " ",
    email: "valid@email.com",
    password: "FakePassword",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "l_name",
    message: "Last name is required",
  });
});
// email
it("returns 400 status and invalid email response", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "Faulty",
    l_name: "Email",
    email: "faultyEmail",
    password: "FakePassword",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "email",
    message: "Email must be valid",
  });
});
it("returns 400 status and missing email resposne", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "Faulty",
    l_name: "Email",
    email: "",
    password: "FakePassword",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "email",
    message: "Email must be valid",
  });
});
// password
it("returns 400 status and short password response", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "Valid",
    l_name: "LastName",
    email: "valid@email.com",
    password: "Short",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "password",
    message: "Password must be at least 8 characters",
  });
});
it("returns 400 status and long password response", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "Valid",
    l_name: "LastName",
    email: "valid@email.com",
    password:
      "LongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLongLong",
  });
  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "password",
    message: "Password must not exceed 64 characters",
  });
});
//Multiple field test
it("returns all signup validation errors", async () => {
  const response = await request(app).post("/api/user/signup").send({
    f_name: "",
    l_name: "",
    email: "invalid",
    password: "short",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      { field: "f_name", message: "First name is required" },
      { field: "l_name", message: "Last name is required" },
      { field: "email", message: "Email must be valid" },
      { field: "password", message: "Password must be at least 8 characters" },
    ]),
  );
});
// Missing field test
it("returns 400 status and validation failure when field is missing", async () => {
  const response = await request(app).post("/api/user/signup").send({
    l_name: "LastName",
    email: "valid@email.com",
    password: "Password",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "f_name",
    message: "First name is required",
  });
});
afterAll(async () => {
  await endTesting();
});
