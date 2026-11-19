import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { WorldRepository } from "../database/repositories/world.repository";
import { WorldService } from "./world.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("WorldService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const repository = {
    findAll: asyncMock(),
    findById: asyncMock(),
    create: asyncMock(),
    update: asyncMock(),
    softDelete: asyncMock(),
  };
  let service: WorldService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorldService,
        { provide: WorldRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(WorldService);
  });

  it("delegates world operations to WorldRepository", async () => {
    repository.findAll.mockResolvedValue([]);
    repository.findById.mockResolvedValue({ world_id: 1 });
    repository.create.mockResolvedValue({ world_id: 2 });
    repository.update.mockResolvedValue({ world_id: 2 });
    repository.softDelete.mockResolvedValue({ kind: "not-found" });

    await service.findAll();
    await service.findById(1);
    await service.create(1, "Maa", "World", 1);
    await service.update(2, "Uusi", "New", 2);
    await service.softDelete(2);

    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalledWith(1, "Maa", "World", 1);
    expect(repository.update).toHaveBeenCalledWith(2, "Uusi", "New", 2);
    expect(repository.softDelete).toHaveBeenCalledWith(2);
  });
});
