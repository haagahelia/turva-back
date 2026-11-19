import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../database/repositories/user.repository";
import { PhysicalRewardRepository } from "../database/repositories/physical-reward.repository";
import { PhysicalRewardService } from "./physical-reward.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("PhysicalRewardService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const users = { findActiveIdByEmail: asyncMock() };
  const rewards = {
    getWorldCompletionCounts: asyncMock(),
    findByUserId: asyncMock(),
    create: asyncMock(),
    findByCode: asyncMock(),
    markClaimed: asyncMock(),
  };
  let service: PhysicalRewardService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PhysicalRewardService,
        { provide: UserRepository, useValue: users },
        { provide: PhysicalRewardRepository, useValue: rewards },
      ],
    }).compile();
    service = module.get(PhysicalRewardService);
  });

  it("rejects claims for unknown users", async () => {
    users.findActiveIdByEmail.mockResolvedValue(undefined);

    await expect(service.claim("missing@example.com")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("requires every world to be completed before claiming", async () => {
    users.findActiveIdByEmail.mockResolvedValue({ user_id: 7 });
    rewards.getWorldCompletionCounts.mockResolvedValue({
      totalWorlds: 3,
      worldsCompleted: 2,
    });

    await expect(service.claim("learner@example.com")).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(rewards.findByUserId).not.toHaveBeenCalled();
  });

  it("rejects claiming when there are no worlds", async () => {
    users.findActiveIdByEmail.mockResolvedValue({ user_id: 7 });
    rewards.getWorldCompletionCounts.mockResolvedValue({
      totalWorlds: 0,
      worldsCompleted: 0,
    });

    await expect(service.claim("learner@example.com")).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("returns an existing unclaimed reward", async () => {
    users.findActiveIdByEmail.mockResolvedValue({ user_id: 7 });
    rewards.getWorldCompletionCounts.mockResolvedValue({
      totalWorlds: 1,
      worldsCompleted: 1,
    });
    rewards.findByUserId.mockResolvedValue({
      reward_code: "abc",
      claimed_at: null,
    });

    await expect(service.claim("learner@example.com")).resolves.toEqual({
      created: false,
      alreadyClaimed: false,
      reward_code: "abc",
    });
  });

  it("creates a reward for an eligible user", async () => {
    users.findActiveIdByEmail.mockResolvedValue({ user_id: 7 });
    rewards.getWorldCompletionCounts.mockResolvedValue({
      totalWorlds: 1,
      worldsCompleted: 1,
    });
    rewards.findByUserId.mockResolvedValue(undefined);
    rewards.create.mockResolvedValue(undefined);

    const result = await service.claim("learner@example.com");

    expect(result).toEqual({
      created: true,
      alreadyClaimed: false,
      reward_code: expect.any(String),
    });
    expect(rewards.create).toHaveBeenCalledWith(7, result.reward_code);
  });

  it("handles unknown and already-claimed codes", async () => {
    rewards.findByCode.mockResolvedValue(undefined);
    await expect(service.verify("missing")).resolves.toEqual({
      kind: "not-found",
    });

    const claimedAt = new Date();
    rewards.findByCode.mockResolvedValue({
      reward_id: 4,
      claimed_at: claimedAt,
      profile_name: "learner",
    });
    await expect(service.verify("used")).resolves.toEqual({
      kind: "already-claimed",
      profileName: "learner",
      claimedAt,
    });
    expect(rewards.markClaimed).not.toHaveBeenCalled();
  });

  it("marks an unused code as claimed", async () => {
    rewards.findByCode.mockResolvedValue({
      reward_id: 4,
      claimed_at: null,
      profile_name: "learner",
    });
    rewards.markClaimed.mockResolvedValue(undefined);

    await expect(service.verify("unused")).resolves.toEqual({
      kind: "claimed",
      profileName: "learner",
    });
    expect(rewards.markClaimed).toHaveBeenCalledWith(4);
  });
});
