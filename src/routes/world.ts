import { Controller, Get, InternalServerErrorException } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { pool } from "../config/db";

@Controller("world")
@ApiTags("World")
export class WorldController {
  @Get("/")
  @ApiOperation({
    summary: "Returns all worlds",
    description: "Selects all from world and returns JSON",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getAllWorlds() {
    try {
      const result = await pool.query("SELECT * FROM World;");
      return result.rows;
    } catch (err) {
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }
}
