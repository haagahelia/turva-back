import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { completedQuizzes, completedWorlds, quizzes } from "../schema";

@Injectable()
export class QuizResultRepository {
  constructor(private readonly database: DatabaseService) {}

  async saveResult(
    userId: number,
    quizId: number,
    score: number,
    timeSpentSeconds: number
  ) {
    await this.database.db
      .insert(completedQuizzes)
      .values({
        user_id: userId,
        quiz_id: quizId,
        score,
        time_spent_seconds: timeSpentSeconds,
      })
      .onConflictDoUpdate({
        target: [completedQuizzes.user_id, completedQuizzes.quiz_id],
        set: {
          score,
          time_spent_seconds: timeSpentSeconds,
          completed_at: sql`CURRENT_TIMESTAMP`,
        },
      });
  }

  async findWorldIdForQuiz(quizId: number) {
    const [quiz] = await this.database.db
      .select({ world_id: quizzes.world_id })
      .from(quizzes)
      .where(eq(quizzes.quiz_id, quizId))
      .limit(1);
    return quiz;
  }

  async getWorldQuizCompletion(worldId: number, userId: number) {
    const [completion] = await this.database.db
      .select({
        total: count(),
        completed: count(completedQuizzes.quiz_id),
      })
      .from(quizzes)
      .leftJoin(
        completedQuizzes,
        and(
          eq(quizzes.quiz_id, completedQuizzes.quiz_id),
          eq(completedQuizzes.user_id, userId)
        )
      )
      .where(eq(quizzes.world_id, worldId));
    return completion;
  }

  async markWorldCompletedIfMissing(userId: number, worldId: number) {
    const inserted = await this.database.db
      .insert(completedWorlds)
      .values({ user_id: userId, world_id: worldId })
      .onConflictDoNothing({
        target: [completedWorlds.user_id, completedWorlds.world_id],
      })
      .returning({ user_id: completedWorlds.user_id });
    return inserted.length > 0;
  }

  async getStats(userId: number) {
    const [stats] = await this.database.db
      .select({
        points: sum(completedQuizzes.score),
        total_time_seconds: sum(completedQuizzes.time_spent_seconds),
      })
      .from(completedQuizzes)
      .where(eq(completedQuizzes.user_id, userId));
    return stats;
  }

  async getHistory(userId: number) {
    return this.database.db
      .select({
        quiz_id: completedQuizzes.quiz_id,
        quiz_name_fi: quizzes.quiz_name_fi,
        quiz_name_en: quizzes.quiz_name_en,
        score: completedQuizzes.score,
        time_spent_seconds: completedQuizzes.time_spent_seconds,
        completed_at: completedQuizzes.completed_at,
      })
      .from(completedQuizzes)
      .innerJoin(quizzes, eq(completedQuizzes.quiz_id, quizzes.quiz_id))
      .where(eq(completedQuizzes.user_id, userId))
      .orderBy(desc(completedQuizzes.completed_at));
  }
}
