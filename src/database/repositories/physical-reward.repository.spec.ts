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
import { PhysicalRewardRepository } from "./physical-reward.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("PhysicalRewardRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: PhysicalRewardRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PhysicalRewardRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(PhysicalRewardRepository);
  });

  it("counts total and completed worlds", async () => {
    mock.enqueueResults([{ total: 3 }], [{ completed: 2 }]);
    await expect(repository.getWorldCompletionCounts(7)).resolves.toEqual({
      totalWorlds: 3,
      worldsCompleted: 2,
    });
  });

  it("finds a reward by user id", async () => {
    const reward = { reward_code: "abc", claimed_at: null };
    mock.enqueueResults([reward]);
    await expect(repository.findByUserId(7)).resolves.toEqual(reward);
  });

  it("creates a reward", async () => {
    mock.enqueueResults([]);
    await expect(repository.create(7, "abc")).resolves.toBeUndefined();
    expect(mock.db.insert).toHaveBeenCalled();
  });

  it("finds a reward code with its owner's name", async () => {
    const reward = { reward_id: 4, profile_name: "learner" };
    mock.enqueueResults([reward]);
    await expect(repository.findByCode("abc")).resolves.toEqual(reward);
  });

  it("marks a reward as claimed", async () => {
    mock.enqueueResults([]);
    await expect(repository.markClaimed(4)).resolves.toBeUndefined();
    expect(mock.db.update).toHaveBeenCalled();
  });
});
