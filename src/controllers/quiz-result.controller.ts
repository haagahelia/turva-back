import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { verifyToken } from "../utils/verification";
import { QuizResultService } from "../services/quiz-result.service";

@Controller("quiz-result")
@ApiTags("Quiz Result")
export class QuizResultController {
  constructor(private readonly quizResults: QuizResultService) {}

  @Post("/")
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    summary: "Save user's quiz result",
    description:
      "Saves the quiz result for the authenticated user and awards a world bonus when all quizzes are completed",
  })
  @ApiBody({
    required: true,
    schema: {
      type: "object",
      required: ["quiz_id", "correct_answers", "time_spent_seconds"],
      properties: {
        quiz_id: { type: "integer", example: 1 },
        correct_answers: { type: "integer", example: 5 },
        time_spent_seconds: { type: "integer", example: 120 },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Result saved successfully" })
  @ApiResponse({ status: 400, description: "Missing required fields" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User or quiz not found" })
  @ApiResponse({ status: 500, description: "Database error" })
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

      const { worldCompleted, bonusAwarded } =
        await this.quizResults.saveResult(
          email,
          Number(quiz_id),
          Number(correct_answers),
          Number(time_spent_seconds)
        );

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

  @Get("/user/:user_id/stats")
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    summary: "Get user's quiz statistics",
    description: "Returns the sum of scores and total time spent by a user",
  })
  @ApiParam({
    name: "user_id",
    type: Number,
    description: "ID of the user to get statistics for",
  })
  @ApiResponse({
    status: 200,
    description: "User quiz statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        points: { type: "integer", example: 15 },
        totalTimeSeconds: { type: "integer", example: 360 },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid user ID" })
  @ApiResponse({ status: 500, description: "Database error" })
  async getUserQuizStats(@Param("user_id") user_id: string) {
    try {
      if (
        typeof user_id !== "string" ||
        user_id.trim() === "" ||
        Number.isNaN(Number(user_id))
      ) {
        throw new BadRequestException({ error: "Invalid user ID" });
      }

      return await this.quizResults.getStats(Number(user_id));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error retrieving quiz statistics:", err);
      throw new InternalServerErrorException({
        error: "Database error while retrieving statistics",
      });
    }
  }

  @Get("/user/:user_id/history")
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    summary: "Get user's quiz history",
    description: "Returns completed quizzes with scores and time spent",
  })
  @ApiParam({ name: "user_id", type: Number, description: "ID of the user" })
  @ApiResponse({ status: 200, description: "Quiz history retrieved" })
  @ApiResponse({ status: 400, description: "Invalid user ID" })
  @ApiResponse({ status: 500, description: "Database error" })
  async getUserQuizHistory(@Param("user_id") user_id: string) {
    try {
      if (
        typeof user_id !== "string" ||
        user_id.trim() === "" ||
        Number.isNaN(Number(user_id))
      ) {
        throw new BadRequestException({ error: "Invalid user ID" });
      }

      return this.quizResults.getHistory(Number(user_id));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error fetching quiz history:", err);
      throw new InternalServerErrorException({
        error: "Database error while fetching history",
      });
    }
  }
}
