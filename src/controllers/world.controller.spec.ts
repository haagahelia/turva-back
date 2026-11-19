import { Test, TestingModule } from "@nestjs/testing";
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
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { WorldController } from "./world.controller";
import { pool } from "../config/db";
import * as verification from "../utils/verification";

describe("WorldController", () => {
  let controller: WorldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorldController],
    }).compile();
    controller = module.get(WorldController);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns all worlds", async () => {
    const rows = [{ world_id: 1, world_name_en: "Rules" }];
    jest.spyOn(pool, "query").mockResolvedValue({ rows, rowCount: 1 } as never);
    await expect(controller.getAllWorlds()).resolves.toEqual(rows);
  });

  it("returns a world by id", async () => {
    const row = { world_id: 2, world_name_en: "Safety" };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [row], rowCount: 1 } as never);
    await expect(controller.getWorldById("2")).resolves.toEqual(row);
  });

  it("rejects invalid world ids", async () => {
    await expect(controller.getWorldById("-1")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns not found for a missing world", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(controller.getWorldById("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("creates a valid world", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const created = { world_id: 3 };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [created], rowCount: 1 } as never);
    await expect(
      controller.createWorld(
        {
          organization_id: 1,
          world_name_fi: "Turvallisuus",
          world_name_en: "Safety",
          order_number: 1,
        },
        "Bearer token"
      )
    ).resolves.toEqual(created);
  });

  it("rejects invalid world fields", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.createWorld(
        {
          organization_id: 0,
          world_name_fi: "",
          world_name_en: "",
          order_number: -1,
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates a world", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const updated = { world_id: 3, world_name_en: "New" };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [updated], rowCount: 1 } as never);
    await expect(
      controller.updateWorld(
        "3",
        {
          world_name_fi: "Uusi",
          world_name_en: "New",
          order_number: 2,
        },
        "Bearer token"
      )
    ).resolves.toEqual({
      message: "Updated successfully",
      updated,
    });
  });

  it("prevents organization changes", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.updateWorld(
        "3",
        {
          organization_id: 2,
          world_name_fi: "Uusi",
          world_name_en: "New",
          order_number: 2,
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("deletes a world", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const deleted = { world_id: 3 };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [deleted], rowCount: 1 } as never);
    await expect(controller.deleteWorld("3", "Bearer token")).resolves.toEqual({
      message: "Deleted successfully",
      deleted,
    });
  });

  it("reports active quizzes before a world delete", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({
        rows: [{ world_exists: true, quiz_count: 2 }],
        rowCount: 1,
      } as never);
    await expect(
      controller.deleteWorld("3", "Bearer token")
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("reports not found when delete has no matching world", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({
        rows: [{ world_exists: false, quiz_count: 0 }],
        rowCount: 1,
      } as never);
    await expect(
      controller.deleteWorld("99", "Bearer token")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects invalid update ids", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.updateWorld("0", {}, "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns not found while updating a missing world", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.updateWorld(
        "99",
        {
          world_name_fi: "Uusi",
          world_name_en: "New",
          order_number: 1,
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects invalid delete ids", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.deleteWorld("0", "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("maps world list database failures to internal server errors", async () => {
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(controller.getAllWorlds()).rejects.toThrow();
  });

  it("maps world update database failures to internal server errors", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(
      controller.updateWorld(
        "3",
        {
          world_name_fi: "Uusi",
          world_name_en: "New",
          order_number: 1,
        },
        "Bearer token"
      )
    ).rejects.toThrow();
  });
});
