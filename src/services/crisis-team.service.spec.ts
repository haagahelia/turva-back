import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { CrisisTeamRepository } from "../database/repositories/crisis-team.repository";
import { CrisisTeamService } from "./crisis-team.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("CrisisTeamService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const repository = {
    findAll: asyncMock(),
    findById: asyncMock(),
    softDelete: asyncMock(),
    create: asyncMock(),
    update: asyncMock(),
  };
  let service: CrisisTeamService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CrisisTeamService,
        { provide: CrisisTeamRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(CrisisTeamService);
  });

  it("delegates read, create, update and delete operations", async () => {
    repository.findAll.mockResolvedValue([]);
    repository.findById.mockResolvedValue({ contact_id: 1 });
    repository.create.mockResolvedValue({ contact_id: 2 });
    repository.update.mockResolvedValue({ contact_id: 2 });
    repository.softDelete.mockResolvedValue({ contact_id: 2 });

    await service.findAll();
    await service.findById(1);
    await service.create(1, "Nimi", "Name", "Rooli", "Role", "123");
    await service.update(2, "Nimi", "Name", "Rooli", "Role", "123");
    await service.softDelete(2);

    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalledWith(
      1,
      "Nimi",
      "Name",
      "Rooli",
      "Role",
      "123"
    );
    expect(repository.update).toHaveBeenCalledWith(
      2,
      "Nimi",
      "Name",
      "Rooli",
      "Role",
      "123"
    );
    expect(repository.softDelete).toHaveBeenCalledWith(2);
  });
});
