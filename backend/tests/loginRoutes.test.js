const request = require("supertest");
const app = require("../app");
const { setupTestData, endTesting } = require("./testHelper");

beforeAll(async () => {
  await setupTestData();
});

// Test structure:
// 1. Arrange: Choose invalid credentials
// 2. Act: Send request
// 4. Assert: expect certain outcome

// login --> happy path
it("returns 200 with valid credentials", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "test@example.com",
    password: "password123",
  });

  expect(response.status).toBe(200);
});

// login --> email issues
it("returns 400 and email must be valid when email is empty", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "",
    password: "fakePassword1",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "email",
    message: "Email must be valid",
  });
});
it("returns 400 and email must be valid when email is whitespace", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: " ",
    password: "fakePassword2",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "email",
    message: "Email must be valid",
  });
});
it("returns 400 and email is required when there is no email", async () => {
  const response = await request(app).post("/api/user/login").send({
    password: "fakePassword3",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "email",
    message: "Email is required",
  });
});
it("returns 400 and email must be a string when the input isn't a string", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: 54354,
    password: "fakePassword4",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "email",
    message: "Email must be a string",
  });
});
it("returns 400 and email must be valid when the input isn't an email", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "notAnEmail",
    password: "fakePassword5",
  });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "email",
    message: "Email must be valid",
  });
});
it("returns 401 with a valid email format but unknown email", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "incorrectEmail@email.com",
    password: "fakePassword5",
  });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid email or password");
});

// login --> password issues
it("returns 400 and password required when password is empty", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "fakeEmail@1.com",
    password: "",
  });

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "password",
    message: "Password is required",
  });
});
it("returns 400 and password required when password is whitespace", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "fakeEmail@2.com",
    password: " ",
  });

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "password",
    message: "Password is required",
  });
});
it("returns 400 and password required when password is missing", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "fakeEmail@3.com",
  });

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "password",
    message: "Password is required",
  });
});

it("returns 401 with a correct email but incorrect password", async () => {
  const response = await request(app).post("/api/user/login").send({
    email: "test@example.com",
    password: "FakePassword",
  });

  expect(response.status).toBe(401);
  expect(response.body.message).toEqual("Invalid email or password");
});

// login --> multiple issues
const msg =
  "returns 400, email must be a string, and password required when email is a number and password is omitted";
it(msg, async () => {
  const response = await request(app).post("/api/user/login").send({
    email: 54353,
  });

  expect(response.body.message).toBe("Validation failed");
  expect(response.status).toBe(400);
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      {
        field: "email",
        message: "Email must be a string",
      },
      {
        field: "password",
        message: "Password is required",
      },
    ]),
  );
});

afterAll(async () => {
  await endTesting();
});
