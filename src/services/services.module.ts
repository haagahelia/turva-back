import { Module } from "@nestjs/common";
import { RepositoriesModule } from "../database/repositories/repositories.module";
import { AuthService } from "./auth.service";
import { CrisisTeamService } from "./crisis-team.service";
import { InfoService } from "./info.service";
import { PhysicalRewardService } from "./physical-reward.service";
import { QuizResultService } from "./quiz-result.service";
import { QuizService } from "./quiz.service";
import { UserService } from "./user.service";
import { VerificationService } from "./verification.service";
import { WorldBonusService } from "./world-bonus.service";
import { WorldService } from "./world.service";

@Module({
  imports: [RepositoriesModule],
  providers: [
    AuthService,
    CrisisTeamService,
    InfoService,
    PhysicalRewardService,
    QuizResultService,
    QuizService,
    UserService,
    VerificationService,
    WorldBonusService,
    WorldService,
  ],
  exports: [
    AuthService,
    CrisisTeamService,
    InfoService,
    PhysicalRewardService,
    QuizResultService,
    QuizService,
    UserService,
    VerificationService,
    WorldBonusService,
    WorldService,
  ],
})
export class ServicesModule {}
