import { Injectable } from "@nestjs/common";
import { and, asc, count, eq, isNull, notExists, sql } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { quizzes, worlds } from "../schema";

@Injectable()
export class WorldRepository {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db
      .select()
      .from(worlds)
      .where(isNull(worlds.deleted_at))
      .orderBy(asc(worlds.order_number));
  }

  async findById(id: number) {
    const [result] = await this.database.db
      .select()
      .from(worlds)
      .where(and(eq(worlds.world_id, id), isNull(worlds.deleted_at)))
      .limit(1);
    return result;
  }

  async create(
    organizationId: number,
    nameFi: string,
    nameEn: string,
    orderNumber: number
  ) {
    const [created] = await this.database.db
      .insert(worlds)
      .values({
        organization_id: organizationId,
        world_name_fi: nameFi,
        world_name_en: nameEn,
        order_number: orderNumber,
      })
      .returning();
    return created;
  }

  async update(
    id: number,
    nameFi: string,
    nameEn: string,
    orderNumber: number
  ) {
    const [updated] = await this.database.db
      .update(worlds)
      .set({
        world_name_fi: nameFi,
        world_name_en: nameEn,
        order_number: orderNumber,
      })
      .where(and(eq(worlds.world_id, id), isNull(worlds.deleted_at)))
      .returning();
    return updated;
  }

  async softDelete(
    id: number
  ): Promise<
    | { kind: "deleted"; world: typeof worlds.$inferSelect }
    | { kind: "not-found" }
    | { kind: "has-active-quizzes"; count: number }
  > {
    const activeQuizzes = this.database.db
      .select({ quiz_id: quizzes.quiz_id })
      .from(quizzes)
      .where(and(eq(quizzes.world_id, id), isNull(quizzes.deleted_at)));
    const [deleted] = await this.database.db
      .update(worlds)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where(
        and(
          eq(worlds.world_id, id),
          isNull(worlds.deleted_at),
          notExists(activeQuizzes)
        )
      )
      .returning();

    if (deleted) {
      return { kind: "deleted", world: deleted };
    }

    const [world] = await this.database.db
      .select({ world_id: worlds.world_id })
      .from(worlds)
      .where(and(eq(worlds.world_id, id), isNull(worlds.deleted_at)))
      .limit(1);

    if (!world) {
      return { kind: "not-found" };
    }

    const [{ quizCount }] = await this.database.db
      .select({ quizCount: count() })
      .from(quizzes)
      .where(and(eq(quizzes.world_id, id), isNull(quizzes.deleted_at)));

    return { kind: "has-active-quizzes", count: quizCount };
  }
}
