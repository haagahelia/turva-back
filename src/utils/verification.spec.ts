import { afterEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import jwt from "jsonwebtoken";
import {
  validateEmail,
  verifyAdminToken,
  verifyPin,
  verifyToken,
  verifyUser,
} from "./verification";

describe("verification utilities", () => {
  afterEach(() => {
    jest.restoreAllMocks();
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

  it("returns false when verifyUser cannot find a username", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);

    await expect(verifyUser("learner@example.com", "missing")).resolves.toBe(
      false
    );
  });

  it("matches both username and email for verifyUser", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ profile_name: "learner", email_address: "learner@example.com" }],
      rowCount: 1,
    } as never);

    await expect(verifyUser("learner@example.com", "learner")).resolves.toBe(
      true
    );
  });

  it("rejects verifyPin with no OTP row", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);

    await expect(verifyPin("learner@example.com", "123456")).resolves.toBe(
      false
    );
  });

  it("rejects an expired verifyPin OTP", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ otp_code: "hash", valid_until: new Date(0) }],
      rowCount: 1,
    } as never);

    await expect(verifyPin("learner@example.com", "123456")).resolves.toBe(
      false
    );
  });

  it("returns true for a matching verifyPin OTP", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ otp_code: "hash", valid_until: new Date(Date.now() + 60_000) }],
      rowCount: 1,
    } as never);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    await expect(verifyPin("learner@example.com", "123456")).resolves.toBe(
      true
    );
  });

  it("decodes a valid bearer token", () => {
    process.env.JWT_SECRET = "verification-test-secret";
    const token = jwt.sign(
      { email: "learner@example.com", username: "learner" },
      "verification-test-secret"
    );
    expect(verifyToken(`Bearer ${token}`)).toEqual(
      expect.objectContaining({
        email: "learner@example.com",
        username: "learner",
      })
    );
  });

  it("rejects verifyToken without a bearer token", () => {
    expect(() => verifyToken()).toThrow();
  });

  it("rejects verifyToken with an invalid bearer token", () => {
    process.env.JWT_SECRET = "verification-test-secret";
    expect(() => verifyToken("Bearer invalid")).toThrow();
  });

  it("allows a valid admin token", async () => {
    process.env.JWT_SECRET = "verification-test-secret";
    const token = jwt.sign(
      { email: "admin@example.com", username: "admin" },
      "verification-test-secret"
    );
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ "?column?": 1 }],
      rowCount: 1,
    } as never);

    await expect(verifyAdminToken(`Bearer ${token}`)).resolves.toEqual(
      expect.objectContaining({
        email: "admin@example.com",
        username: "admin",
      })
    );
  });

  it("rejects an admin token for a non-admin user", async () => {
    process.env.JWT_SECRET = "verification-test-secret";
    const token = jwt.sign(
      { email: "learner@example.com", username: "learner" },
      "verification-test-secret"
    );
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [],
      rowCount: 0,
    } as never);

    await expect(verifyAdminToken(`Bearer ${token}`)).rejects.toThrow();
  });
});
