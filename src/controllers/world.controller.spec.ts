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
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { VerificationService } from "../services/verification.service";
import { WorldService } from "../services/world.service";
import { WorldController } from "./world.controller";

describe("WorldController", () => {
  const worlds = {
    findAll: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findById: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    update: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    softDelete: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  const verification = {
    verifyAdminToken: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: WorldController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WorldController],
      providers: [
        { provide: WorldService, useValue: worlds },
        { provide: VerificationService, useValue: verification },
      ],
    }).compile();

    controller = module.get(WorldController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delegates world listing to WorldService", async () => {
    const items = [{ world_id: 1, world_name_en: "Rules" }];
    worlds.findAll.mockResolvedValue(items);

    await expect(controller.getAllWorlds()).resolves.toBe(items);
    expect(worlds.findAll).toHaveBeenCalledWith();
  });

  it("validates a world id before looking it up", async () => {
    await expect(controller.getWorldById("-1")).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(worlds.findById).not.toHaveBeenCalled();
  });

  it("returns not found when the world does not exist", async () => {
    worlds.findById.mockResolvedValue(undefined);

    await expect(controller.getWorldById("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(worlds.findById).toHaveBeenCalledWith(99);
  });

  it("returns a world found by id", async () => {
    const world = { world_id: 2, world_name_en: "Safety" };
    worlds.findById.mockResolvedValue(world);

    await expect(controller.getWorldById("2")).resolves.toBe(world);
  });

  it("creates a world through WorldService after admin verification", async () => {
    const world = { world_id: 3 };
    worlds.create.mockResolvedValue(world);

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
    ).resolves.toBe(world);

    expect(verification.verifyAdminToken).toHaveBeenCalledWith("Bearer token");
    expect(worlds.create).toHaveBeenCalledWith(1, "Turvallisuus", "Safety", 1);
  });

  it("rejects invalid world fields", async () => {
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
    expect(worlds.create).not.toHaveBeenCalled();
  });

  it("updates a world through WorldService", async () => {
    const updated = { world_id: 3, world_name_en: "New" };
    worlds.update.mockResolvedValue(updated);

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
    ).resolves.toEqual({ message: "Updated successfully", updated });
    expect(worlds.update).toHaveBeenCalledWith(3, "Uusi", "New", 2);
  });

  it("rejects invalid update ids and incomplete update fields", async () => {
    await expect(
      controller.updateWorld("0", {}, "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.updateWorld(
        "3",
        { world_name_fi: "", world_name_en: "New", order_number: 1 },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(worlds.update).not.toHaveBeenCalled();
  });

  it("returns not found when a world update matches no record", async () => {
    worlds.update.mockResolvedValue(undefined);

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
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects attempts to change a world's organization", async () => {
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
    expect(worlds.update).not.toHaveBeenCalled();
  });

  it("reports active quizzes when a world cannot be deleted", async () => {
    worlds.softDelete.mockResolvedValue({
      kind: "has-active-quizzes",
      count: 2,
    });

    await expect(
      controller.deleteWorld("3", "Bearer token")
    ).rejects.toBeInstanceOf(ConflictException);
    expect(worlds.softDelete).toHaveBeenCalledWith(3);
  });

  it("returns not found when the world is absent during deletion", async () => {
    worlds.softDelete.mockResolvedValue({ kind: "not-found" });

    await expect(
      controller.deleteWorld("99", "Bearer token")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deletes a world without active quizzes", async () => {
    const world = { world_id: 3 };
    worlds.softDelete.mockResolvedValue({ kind: "deleted", world });

    await expect(controller.deleteWorld("3", "Bearer token")).resolves.toEqual({
      message: "Deleted successfully",
      deleted: world,
    });
  });

  it("rejects invalid delete ids", async () => {
    await expect(
      controller.deleteWorld("0", "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(worlds.softDelete).not.toHaveBeenCalled();
  });

  it("maps unexpected update errors to an internal server exception", async () => {
    worlds.update.mockRejectedValue(new Error("database down"));

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
    ).rejects.toThrow();
  });
});
