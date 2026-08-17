import jwt, { type VerifyOptions, type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import request from "supertest";
import { app } from "../app";

import {
  AccessTokenClaimsSchema,
  verifyAccessToken,
  issueAccessToken,
} from "../auth/accessToken";
import { setupTestData, endTesting } from "./testHelper";
import { config } from "../config";

// ----- Helpers -----
type VerifiedToken = z.infer<typeof AccessTokenClaimsSchema>;

const decodeTestToken = (
  token: string,
  secret = config.auth.jwtSecret,
): VerifiedToken => {
  const options: VerifyOptions = {
    algorithms: ["HS256"],
    issuer: config.auth.jwtIssuer,
    audience: config.auth.jwtAudience,
  };

  const decoded = jwt.verify(token, secret, options);
  const validate = AccessTokenClaimsSchema.parse(decoded);

  return validate;
};

const fakeToken = (
  {
    algorithm = "HS256",
    expiresIn = config.auth.jwtExpiresIn,
    issuer = config.auth.jwtIssuer,
    audience = config.auth.jwtAudience,
    subject = "4000",
  }: SignOptions,
  { token_use }: { token_use?: string },
  secret = config.auth.jwtSecret,
) => {
  const options: SignOptions = {
    algorithm,
    expiresIn,
    issuer,
    audience,
    subject,
  };

  const payload = token_use === undefined ? {} : { token_use };

  return jwt.sign(payload, secret, options);
};

// ----- Helpers -----

beforeAll(async () => {
  await setupTestData();
});

// --- Happy! ---
it("Verify that round trip returns original userId", () => {
  const userId = 500;
  const token = issueAccessToken(userId);
  const vUserId = verifyAccessToken(token);

  expect(vUserId).toBe(userId);
});
it("Verify that issued token contains sub, token_use, iss, aud, iat, exp, HS256, no userId", () => {
  const userId = 500;
  const token = issueAccessToken(userId);
  const validated = decodeTestToken(token);
  if (typeof validated === "number") {
    throw Error;
  }
  expect(validated.sub).toBe(userId);
  expect(validated.token_use).toBe("access");
  expect(validated.iss).toBe(config.auth.jwtIssuer);
  expect(validated.aud).toBe(config.auth.jwtAudience);
  expect(typeof validated.iat).toBe("number");
  expect(validated.exp >= Date.now() / 1000).toBeTruthy();
  expect(validated).not.toHaveProperty("user_id");
});

// --- Sad :( ---
it.each([0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])(
  "rejects invalid user id %s",
  (userId) => {
    expect(() => issueAccessToken(userId)).toThrow("Invalid user id");
  },
);

it("Rejects malformed token", () => {
  expect(() => verifyAccessToken("i-am-fake")).toThrow();
});

it("Rejects wrong secret", () => {
  const token = fakeToken({}, { token_use: "access" }, "shh");
  expect(() => verifyAccessToken(token)).toThrow();
});

it("Rejects wrong algorithm", () => {
  const token = fakeToken({ algorithm: "HS384" }, { token_use: "access" });
  expect(() => verifyAccessToken(token)).toThrow();
});

it("Rejects wrong issuer", () => {
  const token = fakeToken({ issuer: "faker" }, { token_use: "access" });
  expect(() => verifyAccessToken(token)).toThrow();
});

it("Rejects wrong audience", () => {
  const token = fakeToken({ audience: "faker" }, { token_use: "access" });
  expect(() => verifyAccessToken(token)).toThrow();
});

it("Rejects wrong token_use", () => {
  const token = fakeToken({}, { token_use: "read" });
  expect(() => verifyAccessToken(token)).toThrow();
});

it("Rejects missing token_use", () => {
  const token = fakeToken({}, {});
  expect(() => verifyAccessToken(token)).toThrow();
});

it("Rejects missing sub", () => {
  const token = jwt.sign({ token_use: "access" }, config.auth.jwtSecret, {
    algorithm: "HS256",
    expiresIn: config.auth.jwtExpiresIn,
    issuer: config.auth.jwtIssuer,
    audience: config.auth.jwtAudience,
  });

  expect(() => verifyAccessToken(token)).toThrow();
});

it("Rejects zero sub", () => {
  const token = fakeToken({ subject: "0" }, { token_use: "access" });
  expect(() => verifyAccessToken(token)).toThrow();
});
it("Rejects malformed sub", () => {
  const token = fakeToken({ subject: "faker" }, { token_use: "access" });
  expect(() => verifyAccessToken(token)).toThrow();
});
it("Rejects unsafe sub", () => {
  const token = fakeToken(
    { subject: String(Number.MAX_SAFE_INTEGER + 1) },
    { token_use: "access" },
  );
  expect(() => verifyAccessToken(token)).toThrow();
});
it("Rejects missing iat", () => {
  const token = jwt.sign({ token_use: "access" }, config.auth.jwtSecret, {
    algorithm: "HS256",
    expiresIn: config.auth.jwtExpiresIn,
    issuer: config.auth.jwtIssuer,
    audience: config.auth.jwtAudience,
    subject: "4000",
    noTimestamp: true,
  });

  expect(() => verifyAccessToken(token)).toThrow();
});
it("Rejects missing exp", () => {
  const token = jwt.sign({ token_use: "access" }, config.auth.jwtSecret, {
    algorithm: "HS256",
    issuer: config.auth.jwtIssuer,
    audience: config.auth.jwtAudience,
    subject: "4001",
  });

  expect(() => verifyAccessToken(token)).toThrow();
});
it("Rejects expired token", async () => {
  jest.useFakeTimers();
  const token = fakeToken({ expiresIn: "1h" }, { token_use: "access" });
  jest.advanceTimersByTime(2 * 60 * 60 * 1000);
  expect(() => verifyAccessToken(token)).toThrow();

  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Access token expired");
  jest.useRealTimers();
});

it("rejects tokens with negative and decimal subs", async () => {
  const negToken = fakeToken({ subject: "-1" }, { token_use: "access" });
  const decToken = fakeToken({ subject: "1.5" }, { token_use: "access" });

  expect(() => verifyAccessToken(negToken)).toThrow();
  expect(() => verifyAccessToken(decToken)).toThrow();
});

afterAll(async () => {
  await endTesting();
});
