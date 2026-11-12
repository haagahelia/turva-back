import { Injectable } from "@nestjs/common";
import { WorldBonusRepository } from "../database/repositories/world-bonus.repository";

@Injectable()
export class WorldBonusService {
  constructor(private readonly worldBonus: WorldBonusRepository) {}

  async countCompletedWorlds(userId: number): Promise<number> {
    return this.worldBonus.countCompletedWorlds(userId);
  }
}
