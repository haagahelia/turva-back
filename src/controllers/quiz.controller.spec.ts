import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { QuizService } from "../services/quiz.service";
import { VerificationService } from "../services/verification.service";
import { QuizController } from "./quiz.controller";

describe("QuizController", () => {
  const quizzes = {
    findAll: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findById: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findByWorldId: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    updateContent: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    softDelete: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  const verification = {
    verifyAdminToken: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: QuizController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        { provide: QuizService, useValue: quizzes },
        { provide: VerificationService, useValue: verification },
      ],
    }).compile();

    controller = module.get(QuizController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delegates quiz listing to QuizService", async () => {
    const items = [{ quiz_id: 1 }];
    quizzes.findAll.mockResolvedValue(items);

    await expect(controller.getAllQuizzes()).resolves.toBe(items);
    expect(quizzes.findAll).toHaveBeenCalledWith();
  });

  it("validates quiz ids before querying", async () => {
    await expect(controller.getQuizById("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(quizzes.findById).not.toHaveBeenCalled();
  });

  it("returns not found when no quiz matches an id", async () => {
    quizzes.findById.mockResolvedValue([]);

    await expect(controller.getQuizById("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(quizzes.findById).toHaveBeenCalledWith(99);
  });

  it("returns a quiz found by id", async () => {
    const quizzesForId = [{ quiz_id: 1 }];
    quizzes.findById.mockResolvedValue(quizzesForId);

    await expect(controller.getQuizById("1")).resolves.toBe(quizzesForId);
  });

  it("lists quizzes for a world and handles an empty result", async () => {
    const quizzesForWorld = [{ quiz_id: 1, world_id: 3 }];
    quizzes.findByWorldId.mockResolvedValue(quizzesForWorld);
    await expect(controller.getQuizzesByWorldId("3")).resolves.toBe(
      quizzesForWorld
    );

    quizzes.findByWorldId.mockResolvedValue([]);
    await expect(controller.getQuizzesByWorldId("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("rejects an invalid world id", async () => {
    await expect(controller.getQuizzesByWorldId("")).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(quizzes.findByWorldId).not.toHaveBeenCalled();
  });

  it("creates a quiz through QuizService after admin verification", async () => {
    const quiz = { quiz_id: 1 };
    quizzes.create.mockResolvedValue(quiz);

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
    ).resolves.toBe(quiz);

    expect(verification.verifyAdminToken).toHaveBeenCalledWith("Bearer token");
    expect(quizzes.create).toHaveBeenCalledWith(
      1,
      "Tietovisa",
      "Quiz",
      { fi: {} },
      1
    );
  });

  it("rejects invalid quiz data without creating it", async () => {
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
    expect(quizzes.create).not.toHaveBeenCalled();
  });

  it("rejects invalid quiz ids before updating or deleting", async () => {
    await expect(
      controller.updateQuiz("0", {}, "Bearer token", "application/json")
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.deleteQuiz("0", "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(quizzes.updateContent).not.toHaveBeenCalled();
    expect(quizzes.softDelete).not.toHaveBeenCalled();
  });

  it("returns not found when an update has no matching quiz", async () => {
    quizzes.updateContent.mockResolvedValue(undefined);

    await expect(
      controller.updateQuiz("1", { fi: {} }, "Bearer token", "application/json")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("updates quiz content through QuizService", async () => {
    const updated = { quiz_id: 1 };
    quizzes.updateContent.mockResolvedValue(updated);

    await expect(
      controller.updateQuiz(
        "1",
        { fi: { questions: [] } },
        "Bearer token",
        "application/json"
      )
    ).resolves.toEqual({ message: "Updated successfully", updated });
    expect(quizzes.updateContent).toHaveBeenCalledWith(1, {
      fi: { questions: [] },
    });
  });

  it("rejects a non-JSON quiz update body", async () => {
    await expect(
      controller.updateQuiz("1", {}, "Bearer token", "text/plain")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(quizzes.updateContent).not.toHaveBeenCalled();
  });

  it("returns not found when the requested quiz cannot be deleted", async () => {
    quizzes.softDelete.mockResolvedValue(undefined);

    await expect(
      controller.deleteQuiz("99", "Bearer token")
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(quizzes.softDelete).toHaveBeenCalledWith(99);
  });

  it("deletes a quiz and returns the service result", async () => {
    const deleted = { quiz_id: 1 };
    quizzes.softDelete.mockResolvedValue(deleted);

    await expect(controller.deleteQuiz("1", "Bearer token")).resolves.toEqual({
      message: "Deleted successfully",
      deleted,
    });
  });

  it("maps unexpected creation errors to an internal server exception", async () => {
    quizzes.create.mockRejectedValue(new Error("database down"));

    await expect(
      controller.createQuiz(
        {
          world_id: 1,
          quiz_name_fi: "Tietovisa",
          quiz_name_en: "Quiz",
          order_number: 1,
        },
        "Bearer token"
      )
    ).rejects.toThrow();
  });
});
