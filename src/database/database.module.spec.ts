import { Test } from "@nestjs/testing";
import { describe, expect, it } from "@jest/globals";
import { DRIZZLE_DATABASE } from "./database.constants";
import { DatabaseModule } from "./database.module";
import { DatabaseService } from "./database.service";

describe("DatabaseModule", () => {
  it("provides the Drizzle database and migration service", async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();

    expect(module.get(DRIZZLE_DATABASE)).toBeDefined();
    expect(module.get(DatabaseService)).toBeInstanceOf(DatabaseService);
  });
});
