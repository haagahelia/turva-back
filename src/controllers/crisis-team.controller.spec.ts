import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CrisisTeamService } from "../services/crisis-team.service";
import { CrisisTeamController } from "./crisis-team.controller";

describe("CrisisTeamController", () => {
  const crisisTeam = {
    findAll: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findById: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    softDelete: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    update: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: CrisisTeamController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CrisisTeamController],
      providers: [{ provide: CrisisTeamService, useValue: crisisTeam }],
    }).compile();

    controller = module.get(CrisisTeamController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delegates listing contacts to CrisisTeamService", async () => {
    const contacts = [{ contact_id: 1, name_en: "Rector" }];
    crisisTeam.findAll.mockResolvedValue(contacts);

    await expect(controller.getAllCrisisTeamContacts()).resolves.toBe(contacts);
    expect(crisisTeam.findAll).toHaveBeenCalledWith();
  });

  it("validates a contact id before looking it up", async () => {
    await expect(
      controller.getCrisisTeamContactById("0")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(crisisTeam.findById).not.toHaveBeenCalled();
  });

  it("returns not found when the contact does not exist", async () => {
    crisisTeam.findById.mockResolvedValue(undefined);

    await expect(
      controller.getCrisisTeamContactById("99")
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(crisisTeam.findById).toHaveBeenCalledWith(99);
  });

  it("returns a contact found by id", async () => {
    const contact = { contact_id: 2, name_en: "Security" };
    crisisTeam.findById.mockResolvedValue(contact);

    await expect(controller.getCrisisTeamContactById("2")).resolves.toBe(
      contact
    );
  });

  it("creates a contact through the service", async () => {
    const contact = { contact_id: 3, name_en: "Health" };
    crisisTeam.create.mockResolvedValue(contact);

    await expect(
      controller.createCrisisTeamContact({
        organization_id: 1,
        name_fi: "Terveydenhuolto",
        name_en: "Health",
        role_fi: "Hoito",
        role_en: "Care",
        phone: "123",
      })
    ).resolves.toBe(contact);

    expect(crisisTeam.create).toHaveBeenCalledWith(
      1,
      "Terveydenhuolto",
      "Health",
      "Hoito",
      "Care",
      "123"
    );
  });

  it("rejects incomplete create data without calling the service", async () => {
    await expect(controller.createCrisisTeamContact({})).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(crisisTeam.create).not.toHaveBeenCalled();
  });

  it("maps unexpected creation errors to an internal server exception", async () => {
    crisisTeam.create.mockRejectedValue(new Error("database down"));

    await expect(
      controller.createCrisisTeamContact({
        organization_id: 1,
        name_fi: "Nimi",
        name_en: "Name",
        role_fi: "Rooli",
        role_en: "Role",
        phone: "123",
      })
    ).rejects.toThrow();
  });

  it("updates a contact and returns the service result", async () => {
    const contact = { contact_id: 3, name_en: "Health" };
    crisisTeam.update.mockResolvedValue(contact);

    await expect(
      controller.updateCrisisTeamContact("3", {
        name_fi: "Terveydenhuolto",
        name_en: "Health",
        role_fi: "Hoito",
        role_en: "Care",
        phone: "123",
      })
    ).resolves.toEqual({ message: "Updated successfully", updated: contact });
    expect(crisisTeam.update).toHaveBeenCalledWith(
      3,
      "Terveydenhuolto",
      "Health",
      "Hoito",
      "Care",
      "123"
    );
  });

  it("returns not found when a contact cannot be deleted", async () => {
    crisisTeam.softDelete.mockResolvedValue(undefined);

    await expect(
      controller.deleteCrisisTeamContact("99")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deletes an existing contact", async () => {
    const contact = { contact_id: 3 };
    crisisTeam.softDelete.mockResolvedValue(contact);

    await expect(controller.deleteCrisisTeamContact("3")).resolves.toEqual({
      message: "Deleted successfully",
      deleted: contact,
    });
  });

  it("rejects invalid update ids before calling the service", async () => {
    await expect(
      controller.updateCrisisTeamContact("0", {})
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(crisisTeam.update).not.toHaveBeenCalled();
  });

  it("returns not found when an update matches no contact", async () => {
    crisisTeam.update.mockResolvedValue(undefined);

    await expect(
      controller.updateCrisisTeamContact("3", {
        name_fi: "Nimi",
        name_en: "Name",
        role_fi: "Rooli",
        role_en: "Role",
        phone: "123",
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects missing fields when updating a contact", async () => {
    await expect(
      controller.updateCrisisTeamContact("3", {})
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(crisisTeam.update).not.toHaveBeenCalled();
  });
});
