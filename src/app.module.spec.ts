import { describe, expect, it } from "@jest/globals";
import { AppModule } from "./app.module";

describe("AppModule", () => {
  it("is defined as the application module", () => {
    expect(AppModule).toBeDefined();
  });
});
