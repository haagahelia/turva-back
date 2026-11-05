import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { pool } from "../config/db";

@Controller("world-bonus")
@ApiTags("World Bonus")
export class WorldBonusController {
  @Get("/user/:user_id")
  @ApiOperation({
    summary: "Get user world bonus points",
    description:
      "Returns the number of completed worlds and total bonus points for a user",
  })
  @ApiParam({ name: "user_id", type: Number, description: "ID of the user" })
  @ApiResponse({
    status: 200,
    description: "World bonus data retrieved successfully",
    schema: {
      type: "object",
      properties: {
        completedWorlds: { type: "integer", example: 1 },
        bonusPoints: { type: "integer", example: 10 },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid user ID" })
  @ApiResponse({ status: 500, description: "Database error" })
  async getUserWorldBonus(@Param("user_id") user_id: string) {
    try {
      if (
        typeof user_id !== "string" ||
        user_id.trim() === "" ||
        Number.isNaN(Number(user_id))
      ) {
        throw new BadRequestException({ error: "Invalid user ID" });
      }

      const result = await pool.query(
        `SELECT COUNT(*) as completed_worlds
       FROM User_Completed_World
       WHERE user_id = $1`,
        [user_id]
      );

      const completedWorlds = parseInt(result.rows[0].completed_worlds, 10);
      const bonusPoints = completedWorlds * 10; // 10 points per completed world

      return { completedWorlds, bonusPoints };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error fetching world bonus:", err);
      throw new InternalServerErrorException({ error: "Database error" });
    }
  }
}
