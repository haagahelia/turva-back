import { BadRequestException, Controller, Get, InternalServerErrorException, NotFoundException, Param, Headers, Body, Post, Delete } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { pool } from "../config/db";
import { verifyAdminToken } from "@/utils/verification";

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
      const result = await pool.query("SELECT * FROM World WHERE deleted_at IS NULL ORDER BY order_number;");
      return result.rows;
    } catch (err) {
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }


   // NEWLY ADDED HERE TO THE END
  @Get("/:id")
  async getWorldById(@Param("id") id: string) {
    const worldId = Number(id);

    if (!Number.isInteger(worldId) || worldId <= 0) {
      throw new BadRequestException({
        error: "Invalid ID format"
      });
    }

    const result = await pool.query(
      "SELECT * FROM World WHERE world_id = $1 AND deleted_at IS NULL",
      [worldId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundException({ error: "ID not found" });
    }

    return result.rows[0];
  }

  @Post("/")
  @ApiBearerAuth("bearerAuth")
  async createWorld(
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string
  ) {
    await verifyAdminToken(authorization);

    const {
      organization_id,
      world_name_fi,
      world_name_en,
      order_number,
    } = body;

    if (
      !Number.isInteger(organization_id) ||
      organization_id <= 0 ||
      typeof world_name_fi !== "string" ||
      !world_name_fi.trim() ||
      typeof world_name_en !== "string" ||
      !world_name_en.trim() ||
      !Number.isInteger(order_number) ||
      order_number < 0
    ) {
      throw new BadRequestException({ error: "Invalid world fields" });
    }

    const result = await pool.query(
      `INSERT INTO World
        (organization_id, world_name_fi,         world_name_en, order_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [organization_id, world_name_fi, world_name_en, order_number]
    );

    return result.rows[0];
  }

  @Delete("/:id")
  @ApiBearerAuth("bearerAuth")
  async deleteWorld(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string
  ) {
    await verifyAdminToken(authorization);

    const worldId = Number(id);

    if (!Number.isInteger(worldId) || worldId <= 0) {
      throw new BadRequestException({
        error: "Invalid ID format"
      });
    }

    const result = await pool.query(
      `UPDATE World
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE world_id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [worldId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundException({
        error: "ID not found"
      });
    }

    return { message: "Deleted successfully", deleted: result.rows[0]};
  }

}
