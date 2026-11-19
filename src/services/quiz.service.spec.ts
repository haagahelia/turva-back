import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { QuizRepository } from "../database/repositories/quiz.repository";
import { QuizService } from "./quiz.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("QuizService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const repository = {
    findAll: asyncMock(),
    findById: asyncMock(),
    findByWorldId: asyncMock(),
    create: asyncMock(),
    updateContent: asyncMock(),
    softDelete: asyncMock(),
  };
  let service: QuizService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: QuizRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(QuizService);
  });

  it("delegates quiz operations to QuizRepository", async () => {
    repository.findAll.mockResolvedValue([]);
    repository.findById.mockResolvedValue([]);
    repository.findByWorldId.mockResolvedValue([]);
    repository.create.mockResolvedValue({ quiz_id: 1 });
    repository.updateContent.mockResolvedValue({ quiz_id: 1 });
    repository.softDelete.mockResolvedValue({ quiz_id: 1 });

    await service.findAll();
    await service.findById(1);
    await service.findByWorldId(2);
    await service.create(2, "Nimi", "Name", {}, 1);
    await service.updateContent(1, {});
    await service.softDelete(1);

    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.findByWorldId).toHaveBeenCalledWith(2);
    expect(repository.create).toHaveBeenCalledWith(2, "Nimi", "Name", {}, 1);
    expect(repository.updateContent).toHaveBeenCalledWith(1, {});
    expect(repository.softDelete).toHaveBeenCalledWith(1);
  });
});
