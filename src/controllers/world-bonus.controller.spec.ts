import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { WorldBonusService } from "../services/world-bonus.service";
import { WorldBonusController } from "./world-bonus.controller";

describe("WorldBonusController", () => {
  const worldBonus = {
    countCompletedWorlds: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: WorldBonusController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WorldBonusController],
      providers: [{ provide: WorldBonusService, useValue: worldBonus }],
    }).compile();

    controller = module.get(WorldBonusController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calculates ten bonus points per completed world", async () => {
    worldBonus.countCompletedWorlds.mockResolvedValue(3);

    await expect(controller.getUserWorldBonus("12")).resolves.toEqual({
      completedWorlds: 3,
      bonusPoints: 30,
    });
    expect(worldBonus.countCompletedWorlds).toHaveBeenCalledWith(12);
  });

  it("rejects invalid user ids without querying the service", async () => {
    await expect(controller.getUserWorldBonus("")).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(worldBonus.countCompletedWorlds).not.toHaveBeenCalled();
  });

  it("returns zero points when no worlds are complete", async () => {
    worldBonus.countCompletedWorlds.mockResolvedValue(0);

    await expect(controller.getUserWorldBonus("12")).resolves.toEqual({
      completedWorlds: 0,
      bonusPoints: 0,
    });
  });

  it("maps repository failures to an internal server exception", async () => {
    worldBonus.countCompletedWorlds.mockRejectedValue(
      new Error("database down")
    );

    await expect(controller.getUserWorldBonus("12")).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
  });
});
