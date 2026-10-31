import { Module } from "@nestjs/common";
import { AuthController } from "./auth";
import { CrisisTeamController } from "./crisisTeam";
import { InfoController } from "./info";
import { PhysicalRewardController } from "./physicalReward";
import { QuizController } from "./quiz";
import { QuizResultController } from "./quizResult";
import { UserController } from "./user";
import { WorldBonusController } from "./worldBonus";
import { WorldController } from "./world";
import { RoutesController } from "./index";

@Module({
  controllers: [
    RoutesController,
    AuthController,
    InfoController,
    QuizController,
    WorldController,
    CrisisTeamController,
    UserController,
    QuizResultController,
    WorldBonusController,
    PhysicalRewardController,
  ],
})
export class RoutesModule {}
