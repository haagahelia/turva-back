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
import { QuizRepository } from "./quiz.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("QuizRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: QuizRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuizRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(QuizRepository);
  });

  it("lists quizzes", async () => {
    const quizzes = [{ quiz_id: 1 }];
    mock.enqueueResults(quizzes);
    await expect(repository.findAll()).resolves.toEqual(quizzes);
  });

  it("finds a quiz by id", async () => {
    const quiz = { quiz_id: 1 };
    mock.enqueueResults([quiz]);
    await expect(repository.findById(1)).resolves.toEqual([quiz]);
  });

  it("lists quizzes by world", async () => {
    const quizzes = [{ quiz_id: 1, world_id: 3 }];
    mock.enqueueResults(quizzes);
    await expect(repository.findByWorldId(3)).resolves.toEqual(quizzes);
  });

  it("creates a quiz", async () => {
    const quiz = { quiz_id: 2 };
    mock.enqueueResults([quiz]);
    await expect(
      repository.create(3, "Nimi", "Name", { fi: {} }, 1)
    ).resolves.toEqual(quiz);
  });

  it("updates quiz content", async () => {
    const quiz = { quiz_id: 2 };
    mock.enqueueResults([quiz]);
    await expect(repository.updateContent(2, { fi: {} })).resolves.toEqual(
      quiz
    );
  });

  it("soft deletes a quiz", async () => {
    const quiz = { quiz_id: 2 };
    mock.enqueueResults([quiz]);
    await expect(repository.softDelete(2)).resolves.toEqual(quiz);
  });
});
