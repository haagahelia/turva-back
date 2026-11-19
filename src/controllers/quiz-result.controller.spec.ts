import { Test, TestingModule } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { QuizResultController } from "./quiz-result.controller";
import { pool } from "../config/db";
import * as verification from "../utils/verification";

describe("QuizResultController", () => {
  let controller: QuizResultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizResultController],
    }).compile();
    controller = module.get(QuizResultController);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("saves a quiz result and awards a world bonus", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [{ user_id: 7 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ world_id: 3 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({
        rows: [{ total: "2", completed: "2" }],
        rowCount: 1,
      } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    await expect(
      controller.saveQuizResult(
        {
          quiz_id: 5,
          correct_answers: 4,
          time_spent_seconds: 90,
        },
        "Bearer token"
      )
    ).resolves.toEqual({
      message: "Result saved successfully",
      worldCompleted: true,
      bonusAwarded: true,
    });
  });

  it("rejects missing quiz result fields", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    await expect(
      controller.saveQuizResult({ quiz_id: 5 }, "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns not found for an unknown user", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "missing@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.saveQuizResult(
        {
          quiz_id: 5,
          correct_answers: 4,
          time_spent_seconds: 90,
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns quiz statistics", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ points: "15", total_time_seconds: "360" }],
      rowCount: 1,
    } as never);
    await expect(controller.getUserQuizStats("7")).resolves.toEqual({
      points: 15,
      totalTimeSeconds: 360,
    });
  });

  it("rejects invalid quiz statistics ids", async () => {
    await expect(controller.getUserQuizStats("")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns quiz history", async () => {
    const rows = [{ quiz_id: 5, score: 4 }];
    jest.spyOn(pool, "query").mockResolvedValue({ rows, rowCount: 1 } as never);
    await expect(controller.getUserQuizHistory("7")).resolves.toEqual(rows);
  });

  it("rejects invalid quiz history ids", async () => {
    await expect(controller.getUserQuizHistory("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns not found when the quiz does not exist", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [{ user_id: 7 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.saveQuizResult(
        {
          quiz_id: 99,
          correct_answers: 4,
          time_spent_seconds: 90,
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("maps quiz statistics database failures to internal server errors", async () => {
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(controller.getUserQuizStats("7")).rejects.toThrow();
  });

  it("maps quiz history database failures to internal server errors", async () => {
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(controller.getUserQuizHistory("7")).rejects.toThrow();
  });
});
