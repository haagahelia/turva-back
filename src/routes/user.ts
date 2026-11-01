import {
  Controller,
  Get,
  Headers,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { pool } from "@/config/db";
import { verifyToken } from "@/utils/verification";

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get user profile info
 *     description: Returns profile name and picture URL
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *       '401':
 *         description: Unauthorized, no token or invalid token
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Database query failed
 */
@Controller("user")
export class UserController {
  @Get("/profile")
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
