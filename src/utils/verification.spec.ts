import { afterEach, describe, expect, it } from "@jest/globals";
import jwt from "jsonwebtoken";
import { validateEmail, verifyToken } from "./verification";

describe("verification utilities", () => {
  const originalTestDomain = process.env.TEST_DOMAIN;
  const originalJwtSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalTestDomain === undefined) {
      delete process.env.TEST_DOMAIN;
    } else {
      process.env.TEST_DOMAIN = originalTestDomain;
    }

    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it("accepts a syntactically valid email", () => {
    delete process.env.TEST_DOMAIN;
    expect(validateEmail("learner@example.com")).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(validateEmail("not-an-email")).toBe(false);
  });

  it("enforces TEST_DOMAIN when configured", () => {
    process.env.TEST_DOMAIN = "turva.back.fi";

    expect(validateEmail("learner@other.fi")).toBe(false);
    expect(validateEmail("learner@turva.back.fi")).toBe(true);
  });

  it("decodes a valid bearer token", () => {
    process.env.JWT_SECRET = "verification-test-secret";
    const token = jwt.sign(
      { email: "learner@example.com", username: "learner" },
      process.env.JWT_SECRET
    );

    expect(verifyToken(`Bearer ${token}`)).toEqual(
      expect.objectContaining({
        email: "learner@example.com",
        username: "learner",
      })
    );
  });

  it("rejects missing and invalid bearer tokens", () => {
    process.env.JWT_SECRET = "verification-test-secret";

    expect(() => verifyToken()).toThrow();
    expect(() => verifyToken("Bearer invalid")).toThrow();
  });
});
