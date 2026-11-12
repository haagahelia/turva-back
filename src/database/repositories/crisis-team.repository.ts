import { Injectable } from "@nestjs/common";
import { and, asc, eq, isNull, max, sql } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { crisisTeam } from "../schema";

@Injectable()
export class CrisisTeamRepository {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db
      .select()
      .from(crisisTeam)
      .where(isNull(crisisTeam.deleted_at))
      .orderBy(asc(crisisTeam.order_number));
  }

  async findById(id: number) {
    const [result] = await this.database.db
      .select()
      .from(crisisTeam)
      .where(and(eq(crisisTeam.contact_id, id), isNull(crisisTeam.deleted_at)))
      .limit(1);
    return result;
  }

  async softDelete(id: number) {
    const [deleted] = await this.database.db
      .update(crisisTeam)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(crisisTeam.contact_id, id), isNull(crisisTeam.deleted_at)))
      .returning();
    return deleted;
  }

  async create(
    organization_id: number,
    name_fi: string,
    name_en: string,
    role_fi: string,
    role_en: string,
    phone: string
  ) {
    const [order] = await this.database.db
      .select({ maxOrder: max(crisisTeam.order_number) })
      .from(crisisTeam);
    const [created] = await this.database.db
      .insert(crisisTeam)
      .values({
        organization_id,
        name_fi,
        name_en,
        role_fi,
        role_en,
        phone,
        order_number: (order.maxOrder ?? 0) + 1,
      })
      .returning();
    return created;
  }

  async update(
    id: number,
    name_fi: string,
    name_en: string,
    role_fi: string,
    role_en: string,
    phone: string
  ) {
    const [updated] = await this.database.db
      .update(crisisTeam)
      .set({ name_fi, name_en, role_fi, role_en, phone })
      .where(and(eq(crisisTeam.contact_id, id), isNull(crisisTeam.deleted_at)))
      .returning();
    return updated;
  }
}
