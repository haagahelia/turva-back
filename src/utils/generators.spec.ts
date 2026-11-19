import { describe, expect, it } from "@jest/globals";
import jwt from "jsonwebtoken";
import { generatePin } from "./pinGenerator";
import { generateToken } from "./tokenGenerator";

describe("token and pin generators", () => {
  it("generates a six-digit pin", () => {
    const pin = generatePin();
    expect(pin).toMatch(/^\d{6}$/);
  });

  it("generates a JWT containing email and username", () => {
    process.env.JWT_SECRET = "unit-test-secret";
    const token = generateToken("learner@example.com", "learner");
    const decoded = jwt.verify(token, "unit-test-secret");
    expect(decoded).toEqual(
      expect.objectContaining({
        email: "learner@example.com",
        username: "learner",
      })
    );
  });
});
