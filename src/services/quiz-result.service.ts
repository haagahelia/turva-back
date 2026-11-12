import { Injectable, NotFoundException } from "@nestjs/common";
import { QuizResultRepository } from "../database/repositories/quiz-result.repository";
import { UserRepository } from "../database/repositories/user.repository";

@Injectable()
export class QuizResultService {
  constructor(
    private readonly users: UserRepository,
    private readonly quizResults: QuizResultRepository
  ) {}

  async saveResult(
    email: string,
    quizId: number,
    score: number,
    timeSpentSeconds: number
  ) {
    const user = await this.users.findActiveIdByEmail(email);
    if (!user) {
      throw new NotFoundException({ error: "User not found" });
    }

    await this.quizResults.saveResult(
      user.user_id,
      quizId,
      score,
      timeSpentSeconds
    );
    const quiz = await this.quizResults.findWorldIdForQuiz(quizId);
    if (!quiz) {
      throw new NotFoundException({ error: "Quiz not found" });
    }

    const completion = await this.quizResults.getWorldQuizCompletion(
      quiz.world_id,
      user.user_id
    );
    const worldCompleted = completion.total === completion.completed;
    const bonusAwarded = worldCompleted
      ? await this.quizResults.markWorldCompletedIfMissing(
          user.user_id,
          quiz.world_id
        )
      : false;

    return { worldCompleted, bonusAwarded };
  }

  async getStats(userId: number) {
    const stats = await this.quizResults.getStats(userId);

    return {
      points: Number(stats.points ?? 0),
      totalTimeSeconds: Number(stats.total_time_seconds ?? 0),
    };
  }

  async getHistory(userId: number) {
    return this.quizResults.getHistory(userId);
  }
}
