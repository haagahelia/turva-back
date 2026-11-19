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
import { InfoService } from "../services/info.service";
import { InfoController } from "./info.controller";

describe("InfoController", () => {
  const info = {
    findAll: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findById: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    deleteById: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    update: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: InfoController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [InfoController],
      providers: [{ provide: InfoService, useValue: info }],
    }).compile();

    controller = module.get(InfoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delegates listing pages to InfoService", async () => {
    const pages = [{ id: 1, title: "Rules" }];
    info.findAll.mockResolvedValue(pages);

    await expect(controller.getAllInfoPages()).resolves.toBe(pages);
    expect(info.findAll).toHaveBeenCalledWith();
  });

  it("validates an info page id before looking it up", async () => {
    await expect(controller.getInfoPageById("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(info.findById).not.toHaveBeenCalled();
  });

  it("returns a page found by id", async () => {
    const page = { id: 2, title: "Safety" };
    info.findById.mockResolvedValue(page);

    await expect(controller.getInfoPageById("2")).resolves.toBe(page);
  });

  it("returns not found when InfoService has no matching page", async () => {
    info.findById.mockResolvedValue(undefined);

    await expect(controller.getInfoPageById("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(info.findById).toHaveBeenCalledWith(99);
  });

  it("creates a page through InfoService", async () => {
    const page = { id: 3, title: "Safety", content: "Details" };
    info.create.mockResolvedValue(page);

    await expect(
      controller.createInfoPage({ title: "Safety", content: "Details" })
    ).resolves.toBe(page);
    expect(info.create).toHaveBeenCalledWith("Safety", "Details");
  });

  it("rejects incomplete page data", async () => {
    await expect(
      controller.createInfoPage({ title: "Safety" })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(info.create).not.toHaveBeenCalled();
  });

  it("updates a page through InfoService", async () => {
    const updated = { id: 3, title: "Updated", content: "Details" };
    info.update.mockResolvedValue(updated);

    await expect(
      controller.updateInfoPage({ title: "Updated", content: "Details" }, "3")
    ).resolves.toEqual({ message: "Updated successfully", updated });
    expect(info.update).toHaveBeenCalledWith(3, "Updated", "Details");
  });

  it("returns not found when the page cannot be updated", async () => {
    info.update.mockResolvedValue(undefined);

    await expect(
      controller.updateInfoPage({ title: "Missing", content: "Details" }, "99")
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects invalid ids and incomplete update data", async () => {
    await expect(
      controller.updateInfoPage({ title: "Title", content: "Content" }, "abc")
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.updateInfoPage({ title: "Title" }, "3")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(info.update).not.toHaveBeenCalled();
  });

  it("deletes a page and returns the deleted row", async () => {
    const page = { id: 4, title: "Old" };
    info.deleteById.mockResolvedValue(page);

    await expect(controller.deleteInfoPage("4")).resolves.toEqual({
      message: "Deleted successfully",
      deleted: page,
    });
    expect(info.deleteById).toHaveBeenCalledWith(4);
  });

  it("rejects invalid or missing pages during deletion", async () => {
    await expect(controller.deleteInfoPage("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
    info.deleteById.mockResolvedValue(undefined);
    await expect(controller.deleteInfoPage("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("maps synchronous service failures to internal server exceptions", async () => {
    info.create.mockImplementation(() => {
      throw new Error("database down");
    });

    await expect(
      controller.createInfoPage({ title: "New", content: "Body" })
    ).rejects.toThrow();
  });
});
