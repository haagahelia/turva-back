import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { WorldBonusRepository } from "../database/repositories/world-bonus.repository";
import { WorldBonusService } from "./world-bonus.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("WorldBonusService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const repository = { countCompletedWorlds: asyncMock() };
  let service: WorldBonusService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorldBonusService,
        { provide: WorldBonusRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(WorldBonusService);
  });

  it("delegates completed-world counts", async () => {
    repository.countCompletedWorlds.mockResolvedValue(3);

    await expect(service.countCompletedWorlds(7)).resolves.toBe(3);
    expect(repository.countCompletedWorlds).toHaveBeenCalledWith(7);
  });
});
