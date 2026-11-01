import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";

import { pool } from "../config/db";
import { verifyToken } from "../utils/verification";

/**
 * @openapi
 * /api/quiz-result:
 *   post:
 *     summary: Save user's quiz result
 *     description: Saves the quiz result for a user. Gets userId from JWT token. Also checks if the world is completed and awards bonus if so.
 *     tags:
 *       - Quiz Result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quiz_id
 *               - correct_answers
 *               - time_spent_seconds
 *             properties:
 *               quiz_id:
 *                 type: integer
 *                 example: 1
 *               correct_answers:
 *                 type: integer
 *                 example: 5
 *               time_spent_seconds:
 *                 type: integer
 *                 example: 120
 *     responses:
 *       '201':
 *         description: Result saved successfully
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User or quiz not found
 *       '500':
 *         description: Database error
 */
@Controller("quiz-result")
export class QuizResultController {
  @Post("/")
  async saveQuizResult(
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string
  ) {
    try {
      const { quiz_id, correct_answers, time_spent_seconds } = body;

      const decoded = verifyToken(authorization);
      if (!("email" in decoded) || typeof decoded.email !== "string") {
        throw new UnauthorizedException({ error: "Token is invalid" });
      }
      const email = (decoded as { email: string }).email;

      if (
        !quiz_id ||
        correct_answers === undefined ||
        time_spent_seconds === undefined
      ) {
        throw new BadRequestException({ error: "Missing required fields" });
      }

      const userResult = await pool.query(
        "SELECT user_id FROM TurvaUser WHERE email_address = $1 AND deleted_at IS NULL",
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new NotFoundException({ error: "User not found" });
      }

      const userId = userResult.rows[0].user_id;

      await pool.query(
        `INSERT INTO User_Completed_Quiz (user_id, quiz_id, score, time_spent_seconds)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, quiz_id) DO UPDATE SET
        score = EXCLUDED.score,
        time_spent_seconds = EXCLUDED.time_spent_seconds,
        completed_at = CURRENT_TIMESTAMP`,
        [userId, quiz_id, correct_answers, time_spent_seconds]
      );

      // Get world_id for the quiz
      const quizResult = await pool.query(
        "SELECT world_id FROM Quiz WHERE quiz_id = $1",
        [quiz_id]
      );

      if (quizResult.rows.length === 0) {
        throw new NotFoundException({ error: "Quiz not found" });
      }

      const worldId = quizResult.rows[0].world_id;

      // Check if all quizzes in this world are completed by this user with score >= 1
      const completionResult = await pool.query(
        `SELECT COUNT(*) as total,
      COUNT(ucq.quiz_id) as completed
      FROM Quiz q
      LEFT JOIN User_Completed_Quiz ucq
      ON q.quiz_id = ucq.quiz_id
      AND ucq.user_id = $1
      WHERE q.world_id = $2`,
        [userId, worldId]
      );

      const { total, completed } = completionResult.rows[0];
      const worldCompleted = parseInt(total) === parseInt(completed);
      let bonusAwarded = false;

      if (worldCompleted) {
        const bonusResult = await pool.query(
          `INSERT INTO User_Completed_World (user_id, world_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, world_id) DO NOTHING`,
          [userId, worldId]
        );
        bonusAwarded = (bonusResult.rowCount ?? 0) > 0;
      }

      return {
        message: "Result saved successfully",
        worldCompleted,
        bonusAwarded,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error saving quiz result:", err);
      throw new InternalServerErrorException({ error: "Database error" });
    }
  }

  /**
   * @openapi
   * /api/quiz-result/user/{user_id}/stats:
   *   get:
   *     summary: Get user's quiz statistics
   *     description: Returns sum of score and total time spent for a user
   *     tags:
   *       - Quiz Result
   *     parameters:
   *       - in: path
   *         name: user_id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID of the user to get statistics for
   *     responses:
   *       '200':
   *         description: User quiz statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 points:
   *                   type: integer
   *                   example: 15
   *                 totalTimeSeconds:
   *                   type: integer
   *                   example: 360
   *       '400':
   *         description: Invalid user ID
   *       '500':
   *         description: Database error
   */
  @Get("/user/:user_id/stats")
  async getUserQuizStats(@Param("user_id") user_id: string) {
    try {
      if (
        typeof user_id !== "string" ||
        user_id.trim() === "" ||
        Number.isNaN(Number(user_id))
      ) {
        throw new BadRequestException({ error: "Invalid user ID" });
      }

      const result = await pool.query(
        `SELECT
         COALESCE(SUM(score), 0) AS points,
         COALESCE(SUM(time_spent_seconds), 0) AS total_time_seconds
       FROM User_Completed_Quiz
       WHERE user_id = $1`,
        [user_id]
      );

      const stats = result.rows[0];
      return {
        points: parseInt(stats.points, 10),
        totalTimeSeconds: parseInt(stats.total_time_seconds, 10),
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error retrieving quiz statistics:", err);
      throw new InternalServerErrorException({
        error: "Database error while retrieving statistics",
      });
    }
  }

  /**
   * @openapi
   * /api/quiz-result/user/{user_id}/history:
   *   get:
   *     summary: Get user's quiz history
   *     description: Returns list of completed quizzes with scores and time spent
   *     tags:
   *       - Quiz Result
   *     parameters:
   *       - in: path
   *         name: user_id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID of the user
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   quiz_id:
   *                     type: integer
   *                   quiz_name_fi:
   *                     type: string
   *                   quiz_name_en:
   *                     type: string
   *                   score:
   *                     type: integer
   *                   time_spent_seconds:
   *                     type: integer
   *                   completed_at:
   *                     type: string
   *                     format: date-time
   *       400:
   *         description: Invalid user ID
   *       500:
   *         description: Database error
   */
  @Get("/user/:user_id/history")
  async getUserQuizHistory(@Param("user_id") user_id: string) {
    try {
      if (
        typeof user_id !== "string" ||
        user_id.trim() === "" ||
        Number.isNaN(Number(user_id))
      ) {
        throw new BadRequestException({ error: "Invalid user ID" });
      }

      const result = await pool.query(
        `SELECT 
         uc.quiz_id,
         q.quiz_name_fi,
         q.quiz_name_en,
         uc.score,
         uc.time_spent_seconds,
         uc.completed_at
       FROM User_Completed_Quiz uc
       JOIN Quiz q ON uc.quiz_id = q.quiz_id
       WHERE uc.user_id = $1
       ORDER BY uc.completed_at DESC`,
        [user_id]
      );

      return result.rows;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error fetching quiz history:", err);
      throw new InternalServerErrorException({
        error: "Database error while fetching history",
      });
    }
  }
}
