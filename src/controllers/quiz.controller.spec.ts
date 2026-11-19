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
import { QuizController } from "./quiz.controller";
import { pool } from "../config/db";
import * as verification from "../utils/verification";

describe("QuizController", () => {
  let controller: QuizController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
    }).compile();
    controller = module.get(QuizController);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns all quizzes", async () => {
    const rows = [{ quiz_id: 1 }];
    jest.spyOn(pool, "query").mockResolvedValue({ rows, rowCount: 1 } as never);
    await expect(controller.getAllQuizzes()).resolves.toEqual(rows);
  });

  it("returns a quiz by id", async () => {
    const rows = [{ quiz_id: 2 }];
    jest.spyOn(pool, "query").mockResolvedValue({ rows, rowCount: 1 } as never);
    await expect(controller.getQuizById("2")).resolves.toEqual(rows);
  });

  it("rejects an invalid quiz id", async () => {
    await expect(controller.getQuizById("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns not found for a missing quiz", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(controller.getQuizById("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("returns quizzes by world id", async () => {
    const rows = [{ quiz_id: 1, world_id: 3 }];
    jest.spyOn(pool, "query").mockResolvedValue({ rows, rowCount: 1 } as never);
    await expect(controller.getQuizzesByWorldId("3")).resolves.toEqual(rows);
  });

  it("creates a valid quiz", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const created = { quiz_id: 1 };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [created], rowCount: 1 } as never);
    await expect(
      controller.createQuiz(
        {
          world_id: 1,
          quiz_name_fi: "Tietovisa",
          quiz_name_en: "Quiz",
          quiz_content: { fi: {} },
          order_number: 1,
        },
        "Bearer token"
      )
    ).resolves.toEqual(created);
  });

  it("rejects missing quiz fields", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.createQuiz({}, "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates quiz content", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const updated = { quiz_id: 1 };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [updated], rowCount: 1 } as never);
    await expect(
      controller.updateQuiz(
        "1",
        { fi: { questions: [] } },
        "Bearer token",
        "application/json"
      )
    ).resolves.toEqual({ message: "Updated successfully", updated });
  });

  it("rejects invalid quiz update content", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.updateQuiz("1", null as never, "Bearer token", "text/plain")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("deletes a quiz", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const deleted = { quiz_id: 1 };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [deleted], rowCount: 1 } as never);
    await expect(controller.deleteQuiz("1", "Bearer token")).resolves.toEqual({
      message: "Deleted successfully",
      deleted,
    });
  });

  it("returns not found when deleting a missing quiz", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.deleteQuiz("99", "Bearer token")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects invalid world ids when listing quizzes", async () => {
    await expect(controller.getQuizzesByWorldId("")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns not found for a world with no quizzes", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(controller.getQuizzesByWorldId("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("rejects invalid numeric values while creating a quiz", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.createQuiz(
        {
          world_id: 0,
          quiz_name_fi: "Tietovisa",
          quiz_name_en: "Quiz",
          order_number: -1,
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects invalid ids while updating quiz content", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.updateQuiz("0", { fi: {} }, "Bearer token", "application/json")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns not found while updating a missing quiz", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.updateQuiz(
        "99",
        { fi: {} },
        "Bearer token",
        "application/json"
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects invalid ids while deleting quizzes", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.deleteQuiz("0", "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("maps database failures to internal server errors", async () => {
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(controller.getAllQuizzes()).rejects.toThrow();
  });
});
