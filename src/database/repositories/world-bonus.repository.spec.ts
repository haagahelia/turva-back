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
import { WorldBonusRepository } from "./world-bonus.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("WorldBonusRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: WorldBonusRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorldBonusRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(WorldBonusRepository);
  });

  it("returns the number of completed worlds", async () => {
    mock.enqueueResults([{ completed_worlds: 3 }]);
    await expect(repository.countCompletedWorlds(7)).resolves.toBe(3);
  });
});
