import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { InfoController } from "./info.controller";
import { pool } from "../config/db";

describe("InfoController", () => {
  let controller: InfoController;
  let querySpy: jest.SpiedFunction<typeof pool.query>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoController],
    }).compile();

    controller = module.get(InfoController);
    querySpy = jest.spyOn(pool, "query");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns all info pages ordered by the query", async () => {
    const rows = [{ id: 1, title: "Rules" }];
    querySpy.mockResolvedValue({ rows, rowCount: 1 } as never);

    await expect(controller.getAllInfoPages()).resolves.toEqual(rows);
    expect(querySpy.mock.calls[0]).toEqual(["SELECT * FROM info ORDER BY id;"]);
  });

  it("returns an info page by numeric id", async () => {
    const row = { id: 2, title: "Safety", content: "Details" };
    querySpy.mockResolvedValue({ rows: [row], rowCount: 1 } as never);

    await expect(controller.getInfoPageById("2")).resolves.toEqual(row);
    expect(querySpy.mock.calls[0]).toEqual([
      "SELECT * FROM info WHERE id = $1",
      [2],
    ]);
  });

  it("rejects a non-numeric info id", async () => {
    await expect(controller.getInfoPageById("abc")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns not found when an info page does not exist", async () => {
    querySpy.mockResolvedValue({ rows: [], rowCount: 0 } as never);

    await expect(controller.getInfoPageById("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("creates an info page", async () => {
    const created = { id: 3, title: "New", content: "Body" };
    querySpy.mockResolvedValue({ rows: [created], rowCount: 1 } as never);

    await expect(
      controller.createInfoPage({ title: "New", content: "Body" })
    ).resolves.toEqual(created);
  });

  it("rejects missing create fields", async () => {
    await expect(
      controller.createInfoPage({ title: "New" })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates an existing info page", async () => {
    const updated = { id: 3, title: "Changed", content: "Body" };
    querySpy.mockResolvedValue({ rows: [updated], rowCount: 1 } as never);

    await expect(
      controller.updateInfoPage({ title: "Changed", content: "Body" }, "3")
    ).resolves.toEqual({
      message: "Updated successfully",
      updated,
    });
  });

  it("deletes an existing info page", async () => {
    const deleted = { id: 4, title: "Old", content: "Body" };
    querySpy.mockResolvedValue({ rows: [deleted], rowCount: 1 } as never);

    await expect(controller.deleteInfoPage("4")).resolves.toEqual({
      message: "Deleted successfully",
      deleted,
    });
  });

  it("maps database failures to an internal server exception", async () => {
    querySpy.mockRejectedValue(new Error("database unavailable") as never);

    await expect(controller.getAllInfoPages()).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
  });

  it("returns not found when updating a missing page", async () => {
    querySpy.mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(
      controller.updateInfoPage(
        {
          title: "Missing",
          content: "Body",
        },
        "99"
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns not found when deleting a missing page", async () => {
    querySpy.mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(controller.deleteInfoPage("99")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("rejects invalid update ids", async () => {
    await expect(
      controller.updateInfoPage(
        {
          title: "Title",
          content: "Body",
        },
        "abc"
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
