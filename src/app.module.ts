import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { CrisisTeamController } from "./controllers/crisis-team.controller";
import { InfoController } from "./controllers/info.controller";
import { PhysicalRewardController } from "./controllers/physical-reward.controller";
import { QuizController } from "./controllers/quiz.controller";
import { QuizResultController } from "./controllers/quiz-result.controller";
import { StatusController } from "./controllers/status.controller";
import { UserController } from "./controllers/user.controller";
import { WorldBonusController } from "./controllers/world-bonus.controller";
import { WorldController } from "./controllers/world.controller";

@Module({
  controllers: [
    StatusController,
    AuthController,
    CrisisTeamController,
    InfoController,
    PhysicalRewardController,
    QuizController,
    QuizResultController,
    UserController,
    WorldBonusController,
    WorldController,
  ],
})
export class AppModule {}
