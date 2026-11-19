import { describe, expect, it } from "@jest/globals";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "./schema";

describe("code-first database schema", () => {
  it("defines the application tables and their metadata", () => {
    const tableNames = Object.values(schema).map(
      (table) => getTableConfig(table).name
    );

    expect(tableNames).toEqual(
      expect.arrayContaining([
        "info",
        "email_otps",
        "Organization",
        "TurvaUser",
        "AppPage",
        "World",
        "Quiz",
        "User_Completed_Quiz",
        "CrisisTeam",
        "User_Completed_World",
        "Physical_Reward",
      ])
    );
  });
});
