import { Injectable } from "@nestjs/common";
import { count, eq } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { completedWorlds } from "../schema";

@Injectable()
export class WorldBonusRepository {
  constructor(private readonly database: DatabaseService) {}

  async countCompletedWorlds(userId: number): Promise<number> {
    const [result] = await this.database.db
      .select({ completed_worlds: count() })
      .from(completedWorlds)
      .where(eq(completedWorlds.user_id, userId));
    return result.completed_worlds;
  }
}
