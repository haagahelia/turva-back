import { afterEach, describe, expect, it } from "@jest/globals";
import { validateEmail } from "./email-validation";

describe("email validation", () => {
  const originalTestDomain = process.env.TEST_DOMAIN;

  afterEach(() => {
    if (originalTestDomain === undefined) {
      delete process.env.TEST_DOMAIN;
    } else {
      process.env.TEST_DOMAIN = originalTestDomain;
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
});
