import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { InfoRepository } from "../database/repositories/info.repository";
import { InfoService } from "./info.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("InfoService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const repository = {
    findAll: asyncMock(),
    findById: asyncMock(),
    deleteById: asyncMock(),
    create: asyncMock(),
    update: asyncMock(),
  };
  let service: InfoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InfoService,
        { provide: InfoRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(InfoService);
  });

  it("delegates page operations to InfoRepository", async () => {
    repository.findAll.mockResolvedValue([]);
    repository.findById.mockResolvedValue({ id: 1 });
    repository.deleteById.mockResolvedValue({ id: 1 });
    repository.create.mockResolvedValue({ id: 2 });
    repository.update.mockResolvedValue({ id: 2 });

    await service.findAll();
    await service.findById(1);
    await service.deleteById(1);
    await service.create("Title", "Content");
    await service.update(2, "Updated", "Content");

    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.deleteById).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalledWith("Title", "Content");
    expect(repository.update).toHaveBeenCalledWith(2, "Updated", "Content");
  });
});
