import { ConflictException, Injectable } from "@nestjs/common";
import { EmailOtpRepository } from "../database/repositories/email-otp.repository";
import { UserRepository } from "../database/repositories/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly emailOtps: EmailOtpRepository
  ) {}

  async registerUser(
    organizationId: number,
    username: string,
    email: string
  ): Promise<void> {
    if (await this.users.exists(username, email)) {
      throw new ConflictException({
        error: "Email or username already in use",
      });
    }

    await this.users.create(organizationId, username, email);
  }

  async saveLoginCode(
    email: string,
    hashedPin: string,
    validUntil: Date,
    createdAt: Date
  ): Promise<void> {
    await this.emailOtps.save(email, hashedPin, validUntil, createdAt);
  }
}
