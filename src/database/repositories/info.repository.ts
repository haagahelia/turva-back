import { Injectable } from "@nestjs/common";
import { asc, eq, sql } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { info } from "../schema";

@Injectable()
export class InfoRepository {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db.select().from(info).orderBy(asc(info.id));
  }

  async findById(id: number) {
    const [result] = await this.database.db
      .select()
      .from(info)
      .where(eq(info.id, id))
      .limit(1);
    return result;
  }

  async deleteById(id: number) {
    const [deleted] = await this.database.db
      .delete(info)
      .where(eq(info.id, id))
      .returning();
    return deleted;
  }

  async create(title: string, content: string) {
    const [created] = await this.database.db
      .insert(info)
      .values({ title, content })
      .returning();
    return created;
  }

  async update(id: number, title: string, content: string) {
    const [updated] = await this.database.db
      .update(info)
      .set({ title, content, created_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(info.id, id))
      .returning();
    return updated;
  }
}
