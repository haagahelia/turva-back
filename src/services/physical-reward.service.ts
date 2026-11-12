import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import crypto from "crypto";
import { PhysicalRewardRepository } from "../database/repositories/physical-reward.repository";
import { UserRepository } from "../database/repositories/user.repository";

@Injectable()
export class PhysicalRewardService {
  constructor(
    private readonly users: UserRepository,
    private readonly rewards: PhysicalRewardRepository
  ) {}

  async claim(email: string) {
    const user = await this.users.findActiveIdByEmail(email);
    if (!user) {
      throw new NotFoundException({ error: "User not found" });
    }

    const { totalWorlds, worldsCompleted } =
      await this.rewards.getWorldCompletionCounts(user.user_id);

    if (worldsCompleted < totalWorlds || totalWorlds === 0) {
      throw new ForbiddenException({
        error: "Not all worlds completed",
        completedWorlds: worldsCompleted,
        totalWorlds,
      });
    }

    const existingReward = await this.rewards.findByUserId(user.user_id);
    if (existingReward) {
      return {
        created: false,
        alreadyClaimed: Boolean(existingReward.claimed_at),
        reward_code: existingReward.claimed_at
          ? null
          : existingReward.reward_code,
      };
    }

    const rewardCode = crypto.randomUUID();
    await this.rewards.create(user.user_id, rewardCode);

    return {
      created: true,
      alreadyClaimed: false,
      reward_code: rewardCode,
    };
  }

  async verify(code: string) {
    const result = await this.rewards.findByCode(code);
    if (!result) {
      return { kind: "not-found" as const };
    }

    if (result.claimed_at) {
      return {
        kind: "already-claimed" as const,
        profileName: result.profile_name,
        claimedAt: result.claimed_at,
      };
    }

    await this.rewards.markClaimed(result.reward_id);

    return { kind: "claimed" as const, profileName: result.profile_name };
  }
}
