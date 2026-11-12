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

import { QuizService } from "../services/quiz.service";
import { VerificationService } from "../services/verification.service";

// Shortened example of the quiz_content format used in sql/init.sql
const QUIZ_CONTENT_EXAMPLE = {
  fi: {
    quiz_intro: [
      { title: "p0", type: "quiz_header", content: "Toimi vastuullisesti" },
      { title: "p1", type: "quiz_info", content: "Järjestyssäännöt..." },
    ],
    questions: [
      {
        title: "q1",
        type: "quiz_question",
        content: "Mitä järjestyssäännöt määrittävät?",
        answers: [
          {
            title: "c1",
            content: "Oikeutesi ja velvollisuutesi opiskelijana",
            is_correct: true,
          },
          {
            title: "c2",
            content: "Vain ruokailuajat kampuksella",
            is_correct: false,
          },
        ],
      },
    ],
  },
  en: {
    quiz_intro: [
      { title: "p0", type: "quiz_header", content: "Act responsibly" },
      { title: "p1", type: "quiz_info", content: "The rules of conduct..." },
    ],
    questions: [
      {
        title: "q1",
        type: "quiz_question",
        content: "What do the rules of conduct define?",
        answers: [
          {
            title: "c1",
            content: "Your rights and responsibilities as a student",
            is_correct: true,
          },
          {
            title: "c2",
            content: "Only meal times on campus",
            is_correct: false,
          },
        ],
      },
    ],
  },
};

// PostgreSQL INTEGER upper bound; larger ids can never exist
const MAX_ID = 2147483647;

const parseQuizId = (id: string): number => {
  const quizId = Number(id);
  if (!Number.isInteger(quizId) || quizId <= 0 || quizId > MAX_ID) {
    throw new BadRequestException({ error: "Invalid ID format" });
  }
  return quizId;
};

@Controller("quiz")
@ApiTags("Quiz")
export class QuizController {
  constructor(
    private readonly quizzes: QuizService,
    private readonly verification: VerificationService
  ) {}

  @Get("/")
  @ApiOperation({
    summary: "Returns all quizzes",
    description: "Returns all quizzes in JSON format",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 500, description: "Database query failed" })
  async getAllQuizzes() {
    try {
      return this.quizzes.findAll();
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

      const result = await this.quizzes.findById(Number(id));
      if (result.length === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return result;
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

      const result = await this.quizzes.findByWorldId(Number(world_id));
      if (result.length === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return result;
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
        quiz_content: {
          type: "object",
          description:
            "Quiz texts per language (fi, en): quiz_intro blocks and questions with answers",
          example: QUIZ_CONTENT_EXAMPLE,
        },
        order_number: { type: "integer", example: 1 },
      },
      required: ["world_id", "quiz_name_fi", "quiz_name_en", "order_number"],
    },
  })
  @ApiResponse({ status: 201, description: "Created" })
  @ApiResponse({
    status: 400,
    description: "Missing or invalid world_id, quiz names or order_number",
  })
  @ApiResponse({ status: 401, description: "Missing or invalid token" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 500, description: "Insert failed" })
  @ApiBearerAuth("bearerAuth")
  async createQuiz(
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await this.verification.verifyAdminToken(authorization);

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
        !Number.isInteger(Number(world_id)) ||
        Number(world_id) <= 0 ||
        !Number.isInteger(Number(order_number)) ||
        Number(order_number) < 0
      ) {
        throw new BadRequestException({
          error: "Invalid world_id or order_number",
        });
      }

      return await this.quizzes.create(
        Number(world_id),
        quiz_name_fi,
        quiz_name_en,
        quiz_content ?? {},
        Number(order_number)
      );
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
    description:
      "Replaces quiz_content of an active quiz. The request body is the new quiz_content; names and order are not changed.",
  })
  @ApiBearerAuth("bearerAuth")
  @ApiParam({ name: "id", type: Number })
  @ApiBody({
    description: "New quiz_content JSON (object or array)",
    required: true,
    schema: { type: "object", example: QUIZ_CONTENT_EXAMPLE },
  })
  @ApiResponse({ status: 201, description: "Updated successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid ID format or body is not JSON",
  })
  @ApiResponse({ status: 401, description: "Missing or invalid token" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateQuiz(
    @Param("id") id: string,
    @Body() body: Record<string, any>,
    @Headers("authorization") authorization?: string,
    @Headers("content-type") contentType?: string
  ) {
    try {
      await this.verification.verifyAdminToken(authorization);
      const quizId = parseQuizId(id);

      // Only accept a JSON object or array. Other content types (e.g. form
      // data or plain text) would otherwise be stored as quiz content.
      if (
        !contentType?.toLowerCase().includes("application/json") ||
        body === null ||
        typeof body !== "object"
      ) {
        throw new BadRequestException({
          error: "Request body must be valid JSON",
        });
      }

      const updated = await this.quizzes.updateContent(quizId, body);
      if (!updated) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return { message: "Updated successfully", updated };
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
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 401, description: "Missing or invalid token" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  async deleteQuiz(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string
  ) {
    try {
      await this.verification.verifyAdminToken(authorization);
      const quizId = parseQuizId(id);
      const deleted = await this.quizzes.softDelete(quizId);
      if (!deleted) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return { message: "Deleted successfully", deleted };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Delete failed", err);
      throw new InternalServerErrorException({ error: "Delete failed" });
    }
  }
}
