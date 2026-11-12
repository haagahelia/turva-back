import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { DRIZZLE_DATABASE } from "./database.constants";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    readonly db: NodePgDatabase<typeof schema>
  ) {}

  async onModuleInit(): Promise<void> {
    await migrate(this.db, { migrationsFolder: "./drizzle" });
  }
}
