import {
  Headers,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { pool } from "../config/db";
import { verifyAdminToken } from "@/utils/verification";

@Controller("quiz")
@ApiTags("Quiz")
export class QuizController {
  @Get("/")
  @ApiOperation({
    summary: "Returns all quizzes",
    description: "Returns all quizzes in JSON format",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getAllQuizzes() {
    try {
      const result = await pool.query(
        "SELECT * FROM Quiz WHERE deleted_at IS NULL ORDER BY order_number;"
      );
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
    summary: "Get quiz by ID",
    description:
      "Searches a specific quiz by its ID and returns it in JSON format",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getQuizById(@Param("id") id: string) {
    try {
      if (
        typeof id !== "string" ||
        id.trim() === "" ||
        Number.isNaN(Number(id))
      ) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query(
        "SELECT * FROM quiz WHERE quiz_id = $1 AND deleted_at IS NULL",
        [id]
      );
      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return result.rows;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }

  @Get("/world/:world_id/quizzes")
  @ApiOperation({
    summary: "Get quizzes by world ID",
    description: "Returns quizzes whose world ID matches the supplied world ID",
  })
  @ApiParam({
    name: "world_id",
    type: Number,
    description: "Numeric ID of the world whose quizzes you want",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getQuizzesByWorldId(@Param("world_id") world_id: string) {
    try {
      if (
        typeof world_id !== "string" ||
        world_id.trim() === "" ||
        Number.isNaN(Number(world_id))
      ) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query(
        "SELECT * FROM Quiz WHERE world_id = $1 AND deleted_at IS NULL ORDER BY order_number",
        [world_id]
      );
      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return result.rows;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }

  @Post("/")
  @ApiOperation({
    summary: "Add new quiz to db",
    description: "Insert into quiz",
  })
  @ApiBody({
    description: "Quiz world, Finnish and English names, content, and order",
    required: true,
    schema: {
      type: "object",
      properties: {
        world_id: { type: "integer", example: 1 },
        quiz_name_fi: { type: "string", example: "Uusi tietovisa" },
        quiz_name_en: { type: "string", example: "New Quiz" },
        //quiz_content: { type: "object" },
        //Claude recommends to change quiz_content to either nested JSON or an array. previously it was described as an object
        quiz_content: {
          oneOf: [
            { type: "object", additionalProperties: true },
            { type: "array", items: {} },
          ],
          example: {
            question: "What is the capital of Finland?",
            answer: "Helsinki",
            options: ["Helsinki", "Tampere", "Turku", "Oulu"],
          },
        },
        order_number: { type: "integer", example: 1 },
      },
      required: ["world_id", "quiz_name_fi", "quiz_name_en", "order_number"],
    },
  })

  // ADD AUTHORIZATION
  @ApiResponse({ status: 201, description: "Created" })
  @ApiResponse({
    status: 400,
    description: "world_id, quiz_name_fi, quiz_name_en or order_number missing",
  })
  @ApiResponse({ status: 500, description: "Insert failed" })
  @ApiBearerAuth("bearerAuth")
  async createQuiz(
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await verifyAdminToken(authorization);

      // CORRECTION OF DATA-SHAPE ISSUE, NAME MISMATCHED
      const {
        world_id,
        quiz_name_fi,
        quiz_name_en,
        quiz_content,
        order_number,
      } = body;

      if (
        world_id == null ||
        typeof quiz_name_fi !== "string" ||
        quiz_name_fi.trim() === "" ||
        typeof quiz_name_en !== "string" ||
        quiz_name_en.trim() === "" ||
        order_number == null
      ) {
        throw new BadRequestException({
          error: "world_id, quiz_name_fi, quiz_name_en or order_number missing",
        });
      }

      if (
        !Number.isFinite(Number(world_id)) ||
        Number(world_id) <= 0 ||
        !Number.isFinite(Number(order_number)) ||
        Number(order_number) < 0
      ) {
        throw new BadRequestException({
          error: "Invalid world_id or order_number",
        });
      }

      const result = await pool.query(
        `INSERT INTO Quiz
          (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          world_id,
          quiz_name_fi,
          quiz_name_en,
          JSON.stringify(quiz_content ?? {}),
          order_number,
        ]
      );

      return result.rows[0];
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Insert failed", err);
      throw new InternalServerErrorException({ error: "Insert failed" });
    }
  }

  @HttpCode(201)
  @Put("/:id")
  @ApiOperation({
    summary: "Update Quiz content",
    description: "Update quiz content for quiz where ID matches",
  })

  // ADD AUTHORIZATION
  @ApiBearerAuth("bearerAuth")
  @ApiParam({ name: "id", type: Number })
  @ApiBody({
    description: "quiz content JSON",
    required: true,
    schema: { type: "object", example: { question: "Example question" } },
  })
  @ApiResponse({ status: 201, description: "Updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateQuiz(
    @Param("id") id: string,
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await verifyAdminToken(authorization);
      if (
        typeof id !== "string" ||
        id.trim() === "" ||
        Number.isNaN(Number(id))
      ) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      if (body === undefined) {
        throw new BadRequestException({
          error: "Request body must be valid JSON",
        });
      }

      // THIS CODE ALLOWS ADMINS TO UPDATE ONLY QUIZ_CONTENT
      const result = await pool.query(
        `UPDATE Quiz
        SET quiz_content = $1
        WHERE quiz_id = $2 AND deleted_at IS NULL
        RETURNING *`,
        [JSON.stringify(body), id]
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

  @ApiBearerAuth("bearerAuth")
  @Delete("/:id")
  @ApiOperation({
    summary: "Delete quiz by ID",
    description: "Soft delete an active quiz by its ID",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  async deleteQuiz(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await verifyAdminToken(authorization);
      const result = await pool.query(
        `
          UPDATE Quiz
          SET deleted_at = CURRENT_TIMESTAMP
          WHERE quiz_id = $1 AND deleted_at IS NULL
          RETURNING *
        `,
        [id]
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
}
