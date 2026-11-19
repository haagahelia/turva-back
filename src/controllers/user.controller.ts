import {
  Controller,
  Get,
  Headers,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { verifyToken } from "../utils/verification";
import { UserService } from "../services/user.service";

@Controller("user")
@ApiTags("User")
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get("/profile")
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    summary: "Get user profile info",
    description:
      "Returns profile name, picture URL, email and role ('user' or 'admin')",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, no token or invalid token",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getProfile(@Headers("authorization") authorization?: string) {
    try {
      const decoded = verifyToken(authorization);

      if (!decoded || typeof decoded !== "object" || !("email" in decoded)) {
        throw new HttpException({ error: "Token is invalid" }, 401);
      }

      const { email, username } = decoded as {
        email: string;
        username?: string;
      };
      const user = await this.users.findProfile(email, username);

      if (!user) {
        throw new NotFoundException({ error: "User not found" });
      }

      return {
        userId: user.user_id,
        profileName: user.profile_name,
        profilePictureUrl: user.profile_picture_url,
        email: user.email_address,
        role: user.role,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error fetching profile:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }
}
