import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { UserRepository } from "../database/repositories/user.repository";
import { QuizResultRepository } from "../database/repositories/quiz-result.repository";
import { QuizResultService } from "./quiz-result.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("QuizResultService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const users = { findActiveIdByEmail: asyncMock() };
  const quizResults = {
    saveResult: asyncMock(),
    findWorldIdForQuiz: asyncMock(),
    getWorldQuizCompletion: asyncMock(),
    markWorldCompletedIfMissing: asyncMock(),
    getStats: asyncMock(),
    getHistory: asyncMock(),
  };
  let service: QuizResultService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuizResultService,
        { provide: UserRepository, useValue: users },
        { provide: QuizResultRepository, useValue: quizResults },
      ],
    }).compile();
    service = module.get(QuizResultService);
  });

  it("rejects a result for an unknown user", async () => {
    users.findActiveIdByEmail.mockResolvedValue(undefined);

    await expect(
      service.saveResult("missing@example.com", 5, 4, 90)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("stores results and awards a new world completion", async () => {
    users.findActiveIdByEmail.mockResolvedValue({ user_id: 7 });
    quizResults.findWorldIdForQuiz.mockResolvedValue({ world_id: 3 });
    quizResults.getWorldQuizCompletion.mockResolvedValue({
      total: 2,
      completed: 2,
    });
    quizResults.markWorldCompletedIfMissing.mockResolvedValue(true);

    await expect(
      service.saveResult("learner@example.com", 5, 4, 90)
    ).resolves.toEqual({ worldCompleted: true, bonusAwarded: true });
    expect(quizResults.saveResult).toHaveBeenCalledWith(7, 5, 4, 90);
    expect(quizResults.markWorldCompletedIfMissing).toHaveBeenCalledWith(7, 3);
  });

  it("does not award a bonus before the world is complete", async () => {
    users.findActiveIdByEmail.mockResolvedValue({ user_id: 7 });
    quizResults.findWorldIdForQuiz.mockResolvedValue({ world_id: 3 });
    quizResults.getWorldQuizCompletion.mockResolvedValue({
      total: 2,
      completed: 1,
    });

    await expect(
      service.saveResult("learner@example.com", 5, 4, 90)
    ).resolves.toEqual({ worldCompleted: false, bonusAwarded: false });
    expect(quizResults.markWorldCompletedIfMissing).not.toHaveBeenCalled();
  });

  it("rejects results for quizzes that do not exist", async () => {
    users.findActiveIdByEmail.mockResolvedValue({ user_id: 7 });
    quizResults.findWorldIdForQuiz.mockResolvedValue(undefined);

    await expect(
      service.saveResult("learner@example.com", 99, 4, 90)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("normalizes statistics and delegates history", async () => {
    quizResults.getStats.mockResolvedValue({
      points: "15",
      total_time_seconds: null,
    });
    quizResults.getHistory.mockResolvedValue([{ quiz_id: 5 }]);

    await expect(service.getStats(7)).resolves.toEqual({
      points: 15,
      totalTimeSeconds: 0,
    });
    await expect(service.getHistory(7)).resolves.toEqual([{ quiz_id: 5 }]);
    expect(quizResults.getHistory).toHaveBeenCalledWith(7);
  });
});
