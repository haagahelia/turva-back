import { Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "../config/db";
import { DRIZZLE_DATABASE } from "./database.constants";
import { DatabaseService } from "./database.service";
import * as schema from "./schema";

@Module({
  providers: [
    {
      provide: DRIZZLE_DATABASE,
      useFactory: () => drizzle(pool, { schema }),
    },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
