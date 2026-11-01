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

import { pool } from "@/config/db";
import { verifyToken } from "@/utils/verification";

@Controller("user")
@ApiTags("User")
export class UserController {
  @Get("/profile")
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    summary: "Get user profile info",
    description: "Returns profile name and picture URL",
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

      const email = (decoded as { email: string }).email;
      const query = `
      SELECT user_id, profile_name, profile_picture_url, email_address
      FROM TurvaUser
      WHERE email_address = $1
        AND deleted_at IS NULL
    `;

      const result = await pool.query(query, [email]);

      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "User not found" });
      }

      const user = result.rows[0];

      return {
        userId: user.user_id,
        profileName: user.profile_name,
        profilePictureUrl: user.profile_picture_url,
        email: user.email_address,
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
