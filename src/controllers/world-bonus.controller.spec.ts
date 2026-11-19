import { Test, TestingModule } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import { WorldBonusController } from "./world-bonus.controller";
import { pool } from "../config/db";

describe("WorldBonusController", () => {
  let controller: WorldBonusController;
  let querySpy: jest.SpiedFunction<typeof pool.query>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorldBonusController],
    }).compile();

    controller = module.get(WorldBonusController);
    querySpy = jest.spyOn(pool, "query");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calculates ten bonus points per completed world", async () => {
    querySpy.mockResolvedValue({
      rows: [{ completed_worlds: "3" }],
      rowCount: 1,
    } as never);

    await expect(controller.getUserWorldBonus("12")).resolves.toEqual({
      completedWorlds: 3,
      bonusPoints: 30,
    });
  });

  it("returns zero bonus points for a user with no completed worlds", async () => {
    querySpy.mockResolvedValue({
      rows: [{ completed_worlds: "0" }],
      rowCount: 1,
    } as never);

    await expect(controller.getUserWorldBonus("12")).resolves.toEqual({
      completedWorlds: 0,
      bonusPoints: 0,
    });
  });

  it("rejects an empty user id", async () => {
    await expect(controller.getUserWorldBonus("")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("rejects a non-numeric user id", async () => {
    await expect(controller.getUserWorldBonus("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("maps database failures to internal server errors", async () => {
    querySpy.mockRejectedValue(new Error("database down") as never);
    await expect(controller.getUserWorldBonus("12")).rejects.toThrow();
  });
});
