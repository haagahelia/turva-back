import {
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

import { pool } from "../config/db";

/**
 * @openapi
 * /api/quiz:
 *   get:
 *     summary: Returns all quizzes
 *     description: Returns all quizzes in JSON format
 *     tags:
 *       - Quiz
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
 */
@Controller("quiz")
export class QuizController {
  @Get("/")
  async getAllQuizzes() {
    try {
      const result = await pool.query("SELECT * FROM Quiz;");
      return result.rows;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }

  /**
   * @openapi
   * /api/quiz/{id}:
   *   get:
   *     summary: Get quiz by ID
   *     description: Searches a specific quiz by its ID and returns it in JSON format
   *     tags:
   *       - Quiz
   *     responses:
   *       '200':
   *         description: OK
   *       '400':
   *         description: Invalid ID format
   *       '404':
   *         description: ID not found
   *       '500':
   *         description: Database query failed
   */
  @Get("/:id")
  async getQuizById(@Param("id") id: string) {
    try {
      if (
        typeof id !== "string" ||
        id.trim() === "" ||
        Number.isNaN(Number(id))
      ) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query("SELECT * FROM quiz WHERE quiz_id = $1", [
        id,
      ]);
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

  /**
   * @openapi
   * /api/quiz/world/{world_id}/quizzes:
   *   get:
   *     summary: Get quizzes by world ID
   *     description: Selects all from quiz where the world ID matches the provided world ID
   *     parameters:
   *       - in: path
   *         name: world_id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the world whose quizzes you want
   *     tags:
   *       - Quiz
   *     responses:
   *       '200':
   *         description: OK
   *       '400':
   *         description: Invalid ID format
   *       '404':
   *         description: ID not found
   *       '500':
   *         description: Database query failed
   */
  @Get("/world/:world_id/quizzes")
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
        "SELECT * FROM quiz WHERE world_id = $1",
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

  /**
   * @openapi
   * /api/quiz:
   *   post:
   *     summary: Add new quiz to db
   *     description: Insert into quiz
   *     requestBody:
   *       description: title and content
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             properties:
   *               world_id:
   *                 type: integer
   *                 example: 1
   *               quiz_name:
   *                 type: string
   *                 example: New Quiz
   *               order_number:
   *                 type: integer
   *                 example: 1
   *     tags:
   *       - Quiz
   *     responses:
   *       '201':
   *         description: Created
   *       '400':
   *         description: world_id, quiz_name or order_number missing
   *       '500':
   *         description: Insert failed
   */
  @Post("/")
  async createQuiz(@Body() body: Record<string, any>) {
    try {
      const { world_id, quiz_name, quiz_content, order_number } = body;
      if (
        !world_id ||
        !quiz_name ||
        !order_number ||
        world_id < 0 ||
        order_number < 0
      ) {
        throw new BadRequestException({
          error: "World id, quiz name or order number missing",
        });
      }
      const result = await pool.query(
        "INSERT INTO quiz (world_id, quiz_name, quiz_content, order_number) VALUES ($1, $2, $3, $4) RETURNING *",
        [world_id, quiz_name, JSON.stringify(quiz_content), order_number]
      );
      return result.rows[0];
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Insert failed", err);
      throw new InternalServerErrorException({ error: "Insert failed" });
    }
  }

  /**
   * @openapi
   * /api/quiz/{id}:
   *   put:
   *     summary: Update Quiz content
   *     description: Update quiz content for quiz where ID matches
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the quiz to update
   *     requestBody:
   *       description: quiz content json
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: string
   *             example: Paste the JSON in here!
   *     tags:
   *       - Quiz
   *     responses:
   *       '201':
   *         description: Created
   *       '400':
   *         description: Invalid ID format
   *       '500':
   *         description: Insert failed
   */
  @HttpCode(201)
  @Put("/:id")
  async updateQuiz(@Param("id") id: string, @Body() body: Record<string, any>) {
    try {
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

      const result = await pool.query(
        "UPDATE Quiz SET quiz_content = $1, created_at = CURRENT_TIMESTAMP WHERE quiz_id = $2 RETURNING *",
        [JSON.stringify(body), id]
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

  /**
   * @openapi
   * /api/quiz/{id}:
   *   delete:
   *     summary: Delete quiz by ID
   *     description: Delete a quiz where the ID you give matches the ID of the quiz you want to delete
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the quiz you want to get
   *     tags:
   *       - Quiz
   *     responses:
   *       '200':
   *         description: OK
   *       '404':
   *         description: ID not found
   *       '500':
   *         description: Delete failed
   */
  @Delete("/:id")
  async deleteQuiz(@Param("id") id: string) {
    try {
      const result = await pool.query(
        "DELETE FROM quiz WHERE quiz_id = $1 RETURNING *",
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
