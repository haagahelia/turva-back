import { Test } from "@nestjs/testing";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";
import { DRIZZLE_DATABASE } from "./database.constants";
import { DatabaseService } from "./database.service";

jest.mock("drizzle-orm/node-postgres/migrator", () => ({
  migrate: jest.fn(),
}));

describe("DatabaseService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("runs Drizzle migrations during Nest module initialization", async () => {
    const database = {} as NodePgDatabase<typeof schema>;
    const module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: DRIZZLE_DATABASE, useValue: database },
      ],
    }).compile();
    const service = module.get(DatabaseService);
    jest.mocked(migrate).mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(migrate).toHaveBeenCalledWith(database, {
      migrationsFolder: "./drizzle",
    });
  });
});
