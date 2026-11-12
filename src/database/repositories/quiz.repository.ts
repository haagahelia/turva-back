import { Injectable } from "@nestjs/common";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { quizzes } from "../schema";

@Injectable()
export class QuizRepository {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db
      .select()
      .from(quizzes)
      .where(isNull(quizzes.deleted_at))
      .orderBy(asc(quizzes.order_number));
  }

  async findById(id: number) {
    return this.database.db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.quiz_id, id), isNull(quizzes.deleted_at)))
      .limit(1);
  }

  async findByWorldId(worldId: number) {
    return this.database.db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.world_id, worldId), isNull(quizzes.deleted_at)))
      .orderBy(asc(quizzes.order_number));
  }

  async create(
    worldId: number,
    nameFi: string,
    nameEn: string,
    content: unknown,
    orderNumber: number
  ) {
    const [created] = await this.database.db
      .insert(quizzes)
      .values({
        world_id: worldId,
        quiz_name_fi: nameFi,
        quiz_name_en: nameEn,
        quiz_content: content,
        order_number: orderNumber,
      })
      .returning();
    return created;
  }

  async updateContent(id: number, content: unknown) {
    const [updated] = await this.database.db
      .update(quizzes)
      .set({ quiz_content: content })
      .where(and(eq(quizzes.quiz_id, id), isNull(quizzes.deleted_at)))
      .returning();
    return updated;
  }

  async softDelete(id: number) {
    const [deleted] = await this.database.db
      .update(quizzes)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(quizzes.quiz_id, id), isNull(quizzes.deleted_at)))
      .returning();
    return deleted;
  }
}
