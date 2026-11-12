import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import type { JwtPayload } from "jsonwebtoken";
import { EmailOtpRepository } from "../database/repositories/email-otp.repository";
import { UserRepository } from "../database/repositories/user.repository";
import { verifyToken } from "../utils/verification";

@Injectable()
export class VerificationService {
  constructor(
    private readonly users: UserRepository,
    private readonly emailOtps: EmailOtpRepository
  ) {}

  async verifyAdminToken(authorization?: string): Promise<JwtPayload> {
    const decoded = verifyToken(authorization);

    if (
      typeof decoded.email !== "string" ||
      typeof decoded.username !== "string"
    ) {
      throw new UnauthorizedException({ error: "Token is invalid" });
    }

    const user = await this.users.findAdmin(decoded.email, decoded.username);
    if (!user) {
      throw new ForbiddenException({ error: "Admin access required" });
    }

    return decoded;
  }

  async verifyPin(email: string, pin: string): Promise<boolean> {
    const result = await this.emailOtps.findLatestByEmail(email);
    if (!result) {
      return false;
    }

    const { otp_code, valid_until } = result;
    if (Date.now() > valid_until.getTime()) {
      return false;
    }

    return bcrypt.compare(pin, otp_code);
  }

  async verifyUser(email: string, username: string): Promise<boolean> {
    const result = await this.users.findByUsername(username);
    if (!result) {
      return false;
    }

    const { profile_name, email_address } = result;
    console.log(
      "username " + profile_name + " email " + email_address.toString()
    );
    if (!email_address || !profile_name) {
      return false;
    }

    return username === profile_name && email === email_address;
  }
}
