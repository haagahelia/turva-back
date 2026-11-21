import { describe, expect, it } from "@jest/globals";
import { generatePin } from "./pinGenerator";

describe("pin generator", () => {
  it("generates a six-digit pin", () => {
    const pin = generatePin();
    expect(pin).toMatch(/^\d{6}$/);
  });
});
