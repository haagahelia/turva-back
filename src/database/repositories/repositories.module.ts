import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database.module";
import { CrisisTeamRepository } from "./crisis-team.repository";
import { EmailOtpRepository } from "./email-otp.repository";
import { InfoRepository } from "./info.repository";
import { PhysicalRewardRepository } from "./physical-reward.repository";
import { QuizResultRepository } from "./quiz-result.repository";
import { QuizRepository } from "./quiz.repository";
import { UserRepository } from "./user.repository";
import { WorldBonusRepository } from "./world-bonus.repository";
import { WorldRepository } from "./world.repository";

@Module({
  imports: [DatabaseModule],
  providers: [
    CrisisTeamRepository,
    EmailOtpRepository,
    InfoRepository,
    PhysicalRewardRepository,
    QuizRepository,
    QuizResultRepository,
    UserRepository,
    WorldBonusRepository,
    WorldRepository,
  ],
  exports: [
    CrisisTeamRepository,
    EmailOtpRepository,
    InfoRepository,
    PhysicalRewardRepository,
    QuizRepository,
    QuizResultRepository,
    UserRepository,
    WorldBonusRepository,
    WorldRepository,
  ],
})
export class RepositoriesModule {}
