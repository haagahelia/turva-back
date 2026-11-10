import {
  HttpException,
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Headers,
  Body,
  Post,
  Delete,
  Put,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

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
      const result = await pool.query(
        "SELECT * FROM World WHERE deleted_at IS NULL ORDER BY order_number;"
      );
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
  @ApiOperation({
    summary: "Get world by Id",
    description: "Returns an active world by its Id",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "World foud" })
  @ApiResponse({ status: 400, description: "Invalid Id format" })
  @ApiResponse({ status: 404, description: "World not foud" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getWorldById(@Param("id") id: string) {
    const worldId = Number(id);

    if (!Number.isInteger(worldId) || worldId <= 0) {
      throw new BadRequestException({
        error: "Invalid ID format",
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

    const { organization_id, world_name_fi, world_name_en, order_number } =
      body;

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

  @Put("/:id")
  @ApiOperation({
    summary: "Update a world",
    description: "Updates an active world by Id",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({
    description: "Updated world details",
    required: true,
    schema: {
      type: "object",
      required: [
        "organization_id",
        "world_name_fi",
        "world_name_en",
        "order_number",
      ],
      properties: {
        organization_id: { type: "integer", example: 1 },
        world_name_fi: { type: "string", example: "Uusi maailma" },
        world_name_en: { type: "string", example: "New World" },
        order_number: { type: "integer", example: 1 },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid Id or world fields" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 404, description: "World not found" })
  @ApiResponse({ status: 500, description: "Udpate failed" })
  @ApiBearerAuth("bearerAuth")
  async updateWorld(
    @Param("id") id: string,
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await verifyAdminToken(authorization);

      const worldId = Number(id);

      if (!Number.isInteger(worldId) || worldId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new BadRequestException({ error: "Invalid world fields" });
      }

      const { organization_id, world_name_fi, world_name_en, order_number } =
        body;

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
        throw new BadRequestException({
          error: "Invalid world fields",
        });
      }

      const result = await pool.query(
        `UPDATE World
        SET   organization_id = $1,
              world_name_fi = $2,
              world_name_en = $3,
              order_number = $4
        WHERE world_id = $5 AND deleted_at IS NULL
        RETURNING *`,
        [organization_id, world_name_fi, world_name_en, order_number, worldId]
      );

      if (result.rowCount === 0) {
        throw new BadRequestException({ error: "ID not found" });
      }
      return { message: "Updated successfully", updated: result.rows[0] };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Update failed:", err);
      throw new InternalServerErrorException({ error: "Update failed" });
    }
  }

  @Delete("/:id")
  @ApiOperation({
    summary: "Soft-delete a world",
    description: "Marks an active world as deleted",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "world deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid Id format" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 404, description: "Wolrd not found" })
  @ApiResponse({ status: 500, description: "Deletion failed" })
  @ApiBearerAuth("bearerAuth")
  async deleteWorld(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string
  ) {
    await verifyAdminToken(authorization);

    const worldId = Number(id);

    if (!Number.isInteger(worldId) || worldId <= 0) {
      throw new BadRequestException({
        error: "Invalid ID format",
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
        error: "ID not found",
      });
    }

    return { message: "Deleted successfully", deleted: result.rows[0] };
  }
}
