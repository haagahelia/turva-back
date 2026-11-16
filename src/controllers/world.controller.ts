import {
  HttpException,
  BadRequestException,
  ConflictException,
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

// PostgreSQL INTEGER upper bound; larger ids can never exist
const MAX_ID = 2147483647;

const parseWorldId = (id: string): number => {
  const worldId = Number(id);
  if (!Number.isInteger(worldId) || worldId <= 0 || worldId > MAX_ID) {
    throw new BadRequestException({ error: "Invalid ID format" });
  }
  return worldId;
};

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

  @Get("/:id")
  @ApiOperation({
    summary: "Get world by Id",
    description: "Returns an active world by its Id",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "World found" })
  @ApiResponse({ status: 400, description: "Invalid Id format" })
  @ApiResponse({ status: 404, description: "World not found" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getWorldById(@Param("id") id: string) {
    const worldId = parseWorldId(id);

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
  @ApiOperation({
    summary: "Create a world",
    description: "Adds a new world",
  })
  @ApiBody({
    description: "New world details",
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
  @ApiResponse({ status: 201, description: "Created" })
  @ApiResponse({ status: 400, description: "Invalid world fields" })
  @ApiResponse({ status: 401, description: "Missing or invalid token" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 500, description: "Insert failed" })
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
        (organization_id, world_name_fi, world_name_en, order_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [organization_id, world_name_fi, world_name_en, order_number]
    );

    return result.rows[0];
  }

  @Put("/:id")
  @ApiOperation({
    summary: "Update a world",
    description:
      "Updates the names and order of an active world. The organization of a world cannot be changed.",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({
    description: "Updated world details",
    required: true,
    schema: {
      type: "object",
      required: ["world_name_fi", "world_name_en", "order_number"],
      properties: {
        world_name_fi: { type: "string", example: "Uusi maailma" },
        world_name_en: { type: "string", example: "New World" },
        order_number: { type: "integer", example: 1 },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Updated successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid Id or world fields, or organization_id was sent",
  })
  @ApiResponse({ status: 401, description: "Missing or invalid token" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 404, description: "World not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  @ApiBearerAuth("bearerAuth")
  async updateWorld(
    @Param("id") id: string,
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await verifyAdminToken(authorization);

      const worldId = parseWorldId(id);

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new BadRequestException({ error: "Invalid world fields" });
      }

      // Moving a world (and all its quizzes and user progress) to another
      // organization is not allowed from the API.
      if (body.organization_id !== undefined) {
        throw new BadRequestException({
          error: "organization_id cannot be changed",
        });
      }

      const { world_name_fi, world_name_en, order_number } = body;

      if (
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
        SET world_name_fi = $1,
            world_name_en = $2,
            order_number = $3
        WHERE world_id = $4 AND deleted_at IS NULL
        RETURNING *`,
        [world_name_fi, world_name_en, order_number, worldId]
      );

      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
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
    description:
      "Marks an active world as deleted. Refused while the world still has active quizzes: delete or move them first.",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "World deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid Id format" })
  @ApiResponse({ status: 401, description: "Missing or invalid token" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 404, description: "World not found" })
  @ApiResponse({ status: 409, description: "World still has active quizzes" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  @ApiBearerAuth("bearerAuth")
  async deleteWorld(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await verifyAdminToken(authorization);

      const worldId = parseWorldId(id);

      // The quiz check and the delete happen in one statement, so a quiz
      // added at the same moment cannot slip through.
      const result = await pool.query(
        `UPDATE World
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE world_id = $1
          AND deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM Quiz WHERE world_id = $1 AND deleted_at IS NULL
          )
        RETURNING *`,
        [worldId]
      );

      if (result.rowCount === 0) {
        const quizzes = await pool.query(
          `SELECT
            EXISTS (
              SELECT 1 FROM World WHERE world_id = $1 AND deleted_at IS NULL
            ) AS world_exists,
            (SELECT COUNT(*) FROM Quiz WHERE world_id = $1 AND deleted_at IS NULL)::int AS quiz_count`,
          [worldId]
        );
        const { world_exists, quiz_count } = quizzes.rows[0];

        if (!world_exists) {
          throw new NotFoundException({ error: "ID not found" });
        }
        throw new ConflictException({
          error: `World still has ${quiz_count} active quiz(zes). Delete or move them first.`,
          quiz_count,
        });
      }

      return { message: "Deleted successfully", deleted: result.rows[0] };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Delete failed:", err);
      throw new InternalServerErrorException({ error: "Delete failed" });
    }
  }
}
