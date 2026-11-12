import { Injectable } from "@nestjs/common";
import { and, eq, isNull, or } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { users } from "../schema";

@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseService) {}

  async exists(username: string, email: string): Promise<boolean> {
    const [user] = await this.database.db
      .select({ user_id: users.user_id })
      .from(users)
      .where(
        or(eq(users.profile_name, username), eq(users.email_address, email))
      )
      .limit(1);
    return Boolean(user);
  }

  async create(organizationId: number, username: string, email: string) {
    await this.database.db.insert(users).values({
      organization_id: organizationId,
      profile_name: username,
      email_address: email,
    });
  }

  async findProfile(email: string, username?: string) {
    const conditions = [
      eq(users.email_address, email),
      isNull(users.deleted_at),
    ];
    if (username !== undefined) {
      conditions.push(eq(users.profile_name, username));
    }

    const [user] = await this.database.db
      .select({
        user_id: users.user_id,
        profile_name: users.profile_name,
        profile_picture_url: users.profile_picture_url,
        email_address: users.email_address,
        role: users.role,
      })
      .from(users)
      .where(and(...conditions))
      .limit(1);
    return user;
  }

  async findAdmin(email: string, username: string) {
    const [user] = await this.database.db
      .select({ user_id: users.user_id })
      .from(users)
      .where(
        and(
          eq(users.email_address, email),
          eq(users.profile_name, username),
          eq(users.role, "admin"),
          isNull(users.deleted_at)
        )
      )
      .limit(1);
    return user;
  }

  async findByUsername(username: string) {
    const [user] = await this.database.db
      .select({
        profile_name: users.profile_name,
        email_address: users.email_address,
      })
      .from(users)
      .where(eq(users.profile_name, username))
      .limit(1);
    return user;
  }

  async findActiveIdByEmail(email: string) {
    const [user] = await this.database.db
      .select({ user_id: users.user_id })
      .from(users)
      .where(and(eq(users.email_address, email), isNull(users.deleted_at)))
      .limit(1);
    return user;
  }
}
