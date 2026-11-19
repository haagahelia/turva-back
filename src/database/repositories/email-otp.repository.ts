import { Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { DatabaseService } from "../database.service";
import { emailOtps } from "../schema";

@Injectable()
export class EmailOtpRepository {
  constructor(private readonly database: DatabaseService) {}

  async save(
    email: string,
    hashedPin: string,
    validUntil: Date,
    createdAt: Date
  ) {
    await this.database.db.insert(emailOtps).values({
      email,
      otp_code: hashedPin,
      valid_until: validUntil,
      created_at: createdAt,
    });
  }

  async findLatestByEmail(email: string) {
    const [otp] = await this.database.db
      .select({
        otp_code: emailOtps.otp_code,
        valid_until: emailOtps.valid_until,
      })
      .from(emailOtps)
      .where(eq(emailOtps.email, email))
      .orderBy(desc(emailOtps.created_at))
      .limit(1);
    return otp;
  }
}
