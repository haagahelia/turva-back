import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/auth-user";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

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
  async getProfile(@CurrentUser() currentUser: AuthUser) {
    try {
      if (typeof currentUser.email !== "string") {
        throw new HttpException({ error: "Token is invalid" }, 401);
      }

      const email = currentUser.email;
      const username =
        typeof currentUser.username === "string"
          ? currentUser.username
          : undefined;
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
