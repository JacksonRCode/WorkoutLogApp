import request from "supertest";
import { app } from "../app";

// Happy paths
it("returns a request ID header for a successful request", async () => {
  const response = await request(app).get("/");
  const requestId = response.headers["x-request-id"];

  expect(response.status).toBe(200);
  expect(requestId).toBeTruthy();
  expect(requestId).toEqual(expect.any(String));
});

it("returns a unique request ID for each request", async () => {
  const response1 = await request(app).get("/");
  const response2 = await request(app).get("/");

  expect(response1.headers["x-request-id"]).toBeTruthy();
  expect(response2.headers["x-request-id"]).toBeTruthy();
  expect(response1.headers["x-request-id"]).not.toEqual(
    response2.headers["x-request-id"],
  );
});

it("returns request ID header for an error response", async () => {
  const response = await request(app).get("/fake-path-oops");

  expect(response.status).toBe(404);
  expect(response.headers["x-request-id"]).toBeTruthy();
  expect(response.headers["x-request-id"]).toEqual(expect.any(String));
});
