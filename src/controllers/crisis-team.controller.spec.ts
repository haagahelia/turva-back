import { Test, TestingModule } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CrisisTeamController } from "./crisis-team.controller";
import { pool } from "../config/db";
import * as verification from "../utils/verification";

describe("CrisisTeamController", () => {
  let controller: CrisisTeamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrisisTeamController],
    }).compile();
    controller = module.get(CrisisTeamController);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns all crisis team contacts", async () => {
    const rows = [{ contact_id: 1, name_en: "Rector" }];
    jest.spyOn(pool, "query").mockResolvedValue({ rows, rowCount: 1 } as never);
    await expect(controller.getAllCrisisTeamContacts()).resolves.toEqual(rows);
  });

  it("returns a contact by id", async () => {
    const row = { contact_id: 2, name_en: "Security" };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [row], rowCount: 1 } as never);
    await expect(controller.getCrisisTeamContactById("2")).resolves.toEqual(
      row
    );
  });

  it("rejects invalid contact ids", async () => {
    await expect(
      controller.getCrisisTeamContactById("0")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns not found for a missing contact", async () => {
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.getCrisisTeamContactById("99")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("creates a crisis team contact", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const created = { contact_id: 3, name_en: "Health" };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [created], rowCount: 1 } as never);
    await expect(
      controller.createCrisisTeamContact(
        {
          organization_id: 1,
          name_fi: "Terveydenhuolto",
          name_en: "Health",
          role_fi: "Hoito",
          role_en: "Care",
          phone: "123",
        },
        "Bearer token"
      )
    ).resolves.toEqual(created);
  });

  it("rejects missing create fields", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.createCrisisTeamContact({}, "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates a crisis team contact", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const updated = { contact_id: 3, name_en: "Health" };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [updated], rowCount: 1 } as never);
    await expect(
      controller.updateCrisisTeamContact(
        "3",
        {
          name_fi: "Terveydenhuolto",
          name_en: "Health",
          role_fi: "Hoito",
          role_en: "Care",
          phone: "123",
        },
        "Bearer token"
      )
    ).resolves.toEqual({
      message: "Updated successfully",
      updated,
    });
  });

  it("deletes a crisis team contact", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    const deleted = { contact_id: 3, name_en: "Health" };
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [deleted], rowCount: 1 } as never);
    await expect(
      controller.deleteCrisisTeamContact("3", "Bearer token")
    ).resolves.toEqual({
      message: "Deleted successfully",
      deleted,
    });
  });

  it("rejects invalid update ids", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    await expect(
      controller.updateCrisisTeamContact("0", {}, "Bearer token")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns not found when updating a missing contact", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.updateCrisisTeamContact(
        "99",
        {
          name_fi: "Nimi",
          name_en: "Name",
          role_fi: "Rooli",
          role_en: "Role",
          phone: "123",
        },
        "Bearer token"
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns not found when deleting a missing contact", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.deleteCrisisTeamContact("99", "Bearer token")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("maps list query failures to internal server errors", async () => {
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(controller.getAllCrisisTeamContacts()).rejects.toThrow();
  });

  it("maps contact update database failures to internal server errors", async () => {
    jest.spyOn(verification, "verifyAdminToken").mockResolvedValue({});
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);
    await expect(
      controller.updateCrisisTeamContact(
        "3",
        {
          name_fi: "Nimi",
          name_en: "Name",
          role_fi: "Rooli",
          role_en: "Role",
          phone: "123",
        },
        "Bearer token"
      )
    ).rejects.toThrow();
  });
});
