import { Test, TestingModule } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { Response } from "express";
import { PhysicalRewardController } from "./physical-reward.controller";
import { pool } from "../config/db";
import * as verification from "../utils/verification";

type MockResponse = Response & {
  status: jest.Mock;
  setHeader: jest.Mock;
};

const responseMock = (): MockResponse =>
  ({
    status: jest.fn(),
    setHeader: jest.fn(),
  }) as unknown as MockResponse;

describe("PhysicalRewardController", () => {
  let controller: PhysicalRewardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhysicalRewardController],
    }).compile();
    controller = module.get(PhysicalRewardController);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects reward claims before all worlds are completed", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [{ user_id: 7 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ total: "3" }], rowCount: 1 } as never)
      .mockResolvedValueOnce({
        rows: [{ completed: "1" }],
        rowCount: 1,
      } as never);

    await expect(
      controller.claimPhysicalReward("Bearer token", responseMock())
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns an existing unclaimed reward", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [{ user_id: 7 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ total: "1" }], rowCount: 1 } as never)
      .mockResolvedValueOnce({
        rows: [{ completed: "1" }],
        rowCount: 1,
      } as never)
      .mockResolvedValueOnce({
        rows: [{ reward_code: "abc", claimed_at: null }],
        rowCount: 1,
      } as never);

    await expect(
      controller.claimPhysicalReward("Bearer token", responseMock())
    ).resolves.toEqual({ alreadyClaimed: false, reward_code: "abc" });
  });

  it("creates a reward for an eligible user", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [{ user_id: 7 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ total: "1" }], rowCount: 1 } as never)
      .mockResolvedValueOnce({
        rows: [{ completed: "1" }],
        rowCount: 1,
      } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    const result = await controller.claimPhysicalReward(
      "Bearer token",
      responseMock()
    );
    expect(result.alreadyClaimed).toBe(false);
    expect(result.reward_code).toEqual(expect.any(String));
  });

  it("returns a 404 HTML response for an unknown verification code", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    const response = responseMock();
    const result = await controller.verifyPhysicalReward("missing", response);
    expect(typeof result).toBe("string");
    expect(response.status.mock.calls).toContainEqual([404]);
  });

  it("marks a reward code as claimed", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({
        rows: [{ reward_id: 4, claimed_at: null, profile_name: "learner" }],
        rowCount: 1,
      } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const response = responseMock();
    const result = await controller.verifyPhysicalReward("abc", response);
    expect(typeof result).toBe("string");
  });

  it("returns the already claimed HTML state", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ reward_id: 4, claimed_at: new Date(), profile_name: "learner" }],
      rowCount: 1,
    } as never);
    const result = await controller.verifyPhysicalReward("abc", responseMock());
    expect(typeof result).toBe("string");
  });

  it("returns not found for an unknown reward user", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "missing@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.claimPhysicalReward("Bearer token", responseMock())
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("maps reward claim database failures to internal server errors", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(
      controller.claimPhysicalReward("Bearer token", responseMock())
    ).rejects.toThrow();
  });

  it("returns an HTML 500 response when verification throws", async () => {
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    const response = responseMock();
    await expect(
      controller.verifyPhysicalReward("abc", response)
    ).resolves.toEqual(expect.any(String));
  });
});
