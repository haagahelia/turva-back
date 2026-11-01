import { Controller, Get, InternalServerErrorException } from "@nestjs/common";

import { pool } from "../config/db";

/**
 * @openapi
 * /api/world:
 *   get:
 *     summary: Returns all worlds
 *     description: Selects all from world and returns json
 *     tags:
 *       - Worlds
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
 */
@Controller("world")
export class WorldController {
  @Get("/")
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
