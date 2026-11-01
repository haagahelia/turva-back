import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { pool } from "../config/db";

@Controller("info")
@ApiTags("Info Page")
export class InfoController {
  @Get("/")
  @ApiOperation({
    summary: "Returns all info pages",
    description: "Selects all from info, orders them by id and returns JSON",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getAllInfoPages() {
    try {
      const result = await pool.query("SELECT * FROM info ORDER BY id;");
      return result.rows;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }

  @Get("/:id")
  @ApiOperation({
    summary: "Get info page by ID",
    description: "Selects the info page whose ID matches the provided ID",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Numeric ID of the info to get",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getInfoPageById(@Param("id") id: string) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query("SELECT * FROM info WHERE id = $1", [
        numericId,
      ]);
      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return result.rows[0];
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }

  @Delete("/:id")
  @ApiOperation({
    summary: "Delete info page by ID",
    description: "Delete the info page whose ID matches the supplied ID",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Numeric ID of the info page to delete",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  async deleteInfoPage(@Param("id") id: string) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query(
        "DELETE FROM info WHERE id = $1 RETURNING *",
        [numericId]
      );
      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return { message: "Deleted successfully", deleted: result.rows[0] };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Delete failed", err);
      throw new InternalServerErrorException({ error: "Delete failed" });
    }
  }

  @Post("/")
  @ApiOperation({
    summary: "Add new info to db",
    description: "Insert into info",
  })
  @ApiBody({
    description: "title and content",
    required: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string", example: "New Page Title" },
        content: { type: "string", example: "New page content" },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Created" })
  @ApiResponse({ status: 400, description: "Title or content missing" })
  @ApiResponse({ status: 500, description: "Insert failed" })
  async createInfoPage(@Body() body: Record<string, any>) {
    try {
      const { title, content } = body;
      if (!title || !content) {
        throw new BadRequestException({
          error: "Title or content missing",
        });
      }
      const result = await pool.query(
        "INSERT INTO info (title, content) VALUES ($1, $2) RETURNING *",
        [title, content]
      );
      return result.rows[0];
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Insert failed", err);
      throw new InternalServerErrorException({ error: "Insert failed" });
    }
  }

  @Put("/:id")
  @ApiOperation({
    summary: "Update info",
    description: "Update info page where ID matches",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Numeric ID of the info to update",
  })
  @ApiBody({
    description: "title and content",
    required: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string", example: "New Page Title" },
        content: { type: "string", example: "New page content" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Updated successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid ID format or missing title/content",
  })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateInfoPage(
    @Body() body: Record<string, any>,
    @Param("id") id: string
  ) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const { title, content } = body;
      if (!title || !content) {
        throw new BadRequestException({
          error: "Title or content missing",
        });
      }
      const result = await pool.query(
        "UPDATE info SET title = $1, content = $2, created_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [title, content, numericId]
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
}
