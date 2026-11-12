import { Injectable } from "@nestjs/common";
import { count, eq, sql } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { completedWorlds, physicalRewards, users, worlds } from "../schema";

@Injectable()
export class PhysicalRewardRepository {
  constructor(private readonly database: DatabaseService) {}

  async getWorldCompletionCounts(userId: number) {
    const [worldCount] = await this.database.db
      .select({ total: count() })
      .from(worlds);
    const [completedCount] = await this.database.db
      .select({ completed: count() })
      .from(completedWorlds)
      .where(eq(completedWorlds.user_id, userId));
    return {
      totalWorlds: worldCount.total,
      worldsCompleted: completedCount.completed,
    };
  }

  async findByUserId(userId: number) {
    const [reward] = await this.database.db
      .select({
        reward_code: physicalRewards.reward_code,
        claimed_at: physicalRewards.claimed_at,
      })
      .from(physicalRewards)
      .where(eq(physicalRewards.user_id, userId))
      .limit(1);
    return reward;
  }

  async create(userId: number, rewardCode: string) {
    await this.database.db
      .insert(physicalRewards)
      .values({ user_id: userId, reward_code: rewardCode });
  }

  async findByCode(code: string) {
    const [reward] = await this.database.db
      .select({
        reward_id: physicalRewards.reward_id,
        claimed_at: physicalRewards.claimed_at,
        profile_name: users.profile_name,
      })
      .from(physicalRewards)
      .innerJoin(users, eq(physicalRewards.user_id, users.user_id))
      .where(eq(physicalRewards.reward_code, code))
      .limit(1);
    return reward;
  }

  async markClaimed(rewardId: number) {
    await this.database.db
      .update(physicalRewards)
      .set({ claimed_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(physicalRewards.reward_id, rewardId));
  }
}
