import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { QuizResultService } from "../services/quiz-result.service";
import * as verification from "../utils/verification";
import { QuizResultController } from "./quiz-result.controller";

describe("QuizResultController", () => {
  const quizResults = {
    saveResult: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    getStats: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    getHistory: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: QuizResultController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [QuizResultController],
      providers: [{ provide: QuizResultService, useValue: quizResults }],
    }).compile();

    controller = module.get(QuizResultController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("saves a result for the authenticated user", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    quizResults.saveResult.mockResolvedValue({
      worldCompleted: true,
      bonusAwarded: true,
    });

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
    expect(quizResults.saveResult).toHaveBeenCalledWith(
      "learner@example.com",
      5,
      4,
      90
    );
  });

  it("rejects missing result fields", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });

    await expect(
      controller.saveQuizResult({ quiz_id: 5 }, "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(quizResults.saveResult).not.toHaveBeenCalled();
  });

  it("rejects tokens without an email", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({});

    await expect(
      controller.saveQuizResult(
        {
          quiz_id: 5,
          correct_answers: 4,
          time_spent_seconds: 90,
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("propagates missing-user or missing-quiz errors from the service", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    quizResults.saveResult.mockRejectedValue(
      new NotFoundException({ error: "Quiz not found" })
    );

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

  it("delegates statistics lookup with a numeric user id", async () => {
    const stats = { points: 15, totalTimeSeconds: 360 };
    quizResults.getStats.mockResolvedValue(stats);

    await expect(controller.getUserQuizStats("7")).resolves.toBe(stats);
    expect(quizResults.getStats).toHaveBeenCalledWith(7);
  });

  it("rejects an invalid statistics id without calling the service", async () => {
    await expect(controller.getUserQuizStats("")).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(quizResults.getStats).not.toHaveBeenCalled();
  });

  it("maps statistics service errors to an internal server exception", async () => {
    quizResults.getStats.mockRejectedValue(new Error("database down"));

    await expect(controller.getUserQuizStats("7")).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
  });

  it("delegates history lookup with a numeric user id", async () => {
    const history = [{ quiz_id: 5, score: 4 }];
    quizResults.getHistory.mockResolvedValue(history);

    await expect(controller.getUserQuizHistory("7")).resolves.toBe(history);
    expect(quizResults.getHistory).toHaveBeenCalledWith(7);
  });

  it("rejects an invalid history id without calling the service", async () => {
    await expect(controller.getUserQuizHistory("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(quizResults.getHistory).not.toHaveBeenCalled();
  });

  it("maps history service errors to an internal server exception", async () => {
    quizResults.getHistory.mockRejectedValue(new Error("database down"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(controller.getUserQuizHistory("7")).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
  });
});
