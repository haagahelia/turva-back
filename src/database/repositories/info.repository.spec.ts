import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { DatabaseService } from "../database.service";
import { InfoRepository } from "./info.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("InfoRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: InfoRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InfoRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(InfoRepository);
  });

  it("lists pages", async () => {
    const pages = [{ id: 1 }];
    mock.enqueueResults(pages);
    await expect(repository.findAll()).resolves.toEqual(pages);
  });

  it("finds a page by id", async () => {
    const page = { id: 2 };
    mock.enqueueResults([page]);
    await expect(repository.findById(2)).resolves.toEqual(page);
  });

  it("deletes a page and returns the deleted row", async () => {
    const page = { id: 2 };
    mock.enqueueResults([page]);
    await expect(repository.deleteById(2)).resolves.toEqual(page);
    expect(mock.db.delete).toHaveBeenCalled();
  });

  it("creates a page", async () => {
    const page = { id: 3, title: "Safety", content: "Details" };
    mock.enqueueResults([page]);
    await expect(repository.create("Safety", "Details")).resolves.toEqual(page);
    expect(mock.db.insert).toHaveBeenCalled();
  });

  it("updates a page", async () => {
    const page = { id: 3, title: "Updated" };
    mock.enqueueResults([page]);
    await expect(repository.update(3, "Updated", "Details")).resolves.toEqual(
      page
    );
    expect(mock.db.update).toHaveBeenCalled();
  });
});
