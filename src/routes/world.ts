import { Controller, Get, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

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
  async getAllWorlds(
    @Req() _req: Request,
    @Res() res: Response
  ): Promise<void> {
    try {
      const result = await pool.query("SELECT * FROM World;");
      res.json(result.rows);
    } catch (err) {
      console.error("Error in query:", err);
      res.status(500).json({ error: "Database query failed" });
    }
  }
}
