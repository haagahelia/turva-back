import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { DatabaseService } from "../database.service";
import { QuizResultRepository } from "./quiz-result.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("QuizResultRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: QuizResultRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuizResultRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(QuizResultRepository);
  });

  it("upserts a quiz result", async () => {
    mock.enqueueResults([]);
    await expect(repository.saveResult(7, 5, 4, 90)).resolves.toBeUndefined();
    expect(mock.db.insert).toHaveBeenCalled();
  });

  it("looks up the quiz's world", async () => {
    const quiz = { world_id: 3 };
    mock.enqueueResults([quiz]);
    await expect(repository.findWorldIdForQuiz(5)).resolves.toEqual(quiz);
  });

  it("counts completed quizzes in a world", async () => {
    const completion = { total: 2, completed: 1 };
    mock.enqueueResults([completion]);
    await expect(repository.getWorldQuizCompletion(3, 7)).resolves.toEqual(
      completion
    );
  });

  it("reports whether a world completion row was newly inserted", async () => {
    mock.enqueueResults([{ user_id: 7 }]);
    await expect(repository.markWorldCompletedIfMissing(7, 3)).resolves.toBe(
      true
    );
  });

  it("reports when a world completion already exists", async () => {
    mock.enqueueResults([]);
    await expect(repository.markWorldCompletedIfMissing(7, 3)).resolves.toBe(
      false
    );
  });

  it("retrieves quiz statistics", async () => {
    const stats = { points: "15", total_time_seconds: "360" };
    mock.enqueueResults([stats]);
    await expect(repository.getStats(7)).resolves.toEqual(stats);
  });

  it("retrieves quiz history", async () => {
    const history = [{ quiz_id: 5, score: 4 }];
    mock.enqueueResults(history);
    await expect(repository.getHistory(7)).resolves.toEqual(history);
  });
});
