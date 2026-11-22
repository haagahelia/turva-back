import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ForbiddenException } from "@nestjs/common";
import type { Response } from "express";
import { PhysicalRewardService } from "../services/physical-reward.service";
import { PhysicalRewardController } from "./physical-reward.controller";

describe("PhysicalRewardController", () => {
  const physicalRewards = {
    claim: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    verify: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: PhysicalRewardController;

  const response = () => {
    const status = jest.fn();
    const setHeader = jest.fn();
    return {
      response: { status, setHeader } as unknown as Response,
      status,
      setHeader,
    };
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PhysicalRewardController],
      providers: [
        { provide: PhysicalRewardService, useValue: physicalRewards },
      ],
    }).compile();

    controller = module.get(PhysicalRewardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("passes the verified email to the reward service", async () => {
    physicalRewards.claim.mockResolvedValue({
      created: true,
      alreadyClaimed: false,
      reward_code: "abc",
    });

    await expect(
      controller.claimPhysicalReward(
        { email: "learner@example.com" },
        response().response
      )
    ).resolves.toEqual({ alreadyClaimed: false, reward_code: "abc" });
    expect(physicalRewards.claim).toHaveBeenCalledWith("learner@example.com");
  });

  it("rejects a claim when the token has no email", async () => {
    await expect(
      controller.claimPhysicalReward({}, response().response)
    ).rejects.toThrow();
    expect(physicalRewards.claim).not.toHaveBeenCalled();
  });

  it("propagates reward eligibility errors", async () => {
    physicalRewards.claim.mockRejectedValue(
      new ForbiddenException({ error: "Not all worlds completed" })
    );

    await expect(
      controller.claimPhysicalReward(
        { email: "learner@example.com" },
        response().response
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns not-found HTML for an unknown reward code", async () => {
    const { response: res, status, setHeader } = response();
    physicalRewards.verify.mockResolvedValue({ kind: "not-found" });

    const html = await controller.verifyPhysicalReward("missing", res);

    expect(html).toContain("Koodia ei löydy");
    expect(status).toHaveBeenCalledWith(404);
    expect(setHeader).toHaveBeenCalledWith("Content-Type", "text/html");
  });

  it("returns claimed HTML after verifying a reward code", async () => {
    const { response: res, status } = response();
    physicalRewards.verify.mockResolvedValue({
      kind: "claimed",
      profileName: "learner",
    });

    const html = await controller.verifyPhysicalReward("abc", res);

    expect(html).toContain("learner");
    expect(status).not.toHaveBeenCalled();
    expect(physicalRewards.verify).toHaveBeenCalledWith("abc");
  });

  it("returns the already-claimed HTML state", async () => {
    const { response: res } = response();
    physicalRewards.verify.mockResolvedValue({
      kind: "already-claimed",
      profileName: "learner",
      claimedAt: new Date("2025-01-01"),
    });

    const html = await controller.verifyPhysicalReward("used", res);

    expect(html).toContain("Koodi on jo käytetty");
    expect(html).toContain("learner");
  });

  it("returns an error page if reward verification fails", async () => {
    const { response: res, status } = response();
    physicalRewards.verify.mockRejectedValue(new Error("database down"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    const html = await controller.verifyPhysicalReward("abc", res);

    expect(html).toContain("Koodia ei löydy");
    expect(status).toHaveBeenCalledWith(500);
  });
});
