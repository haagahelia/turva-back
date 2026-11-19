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
import { WorldRepository } from "./world.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("WorldRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: WorldRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorldRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(WorldRepository);
  });

  it("lists worlds", async () => {
    const worlds = [{ world_id: 1 }];
    mock.enqueueResults(worlds);
    await expect(repository.findAll()).resolves.toEqual(worlds);
  });

  it("finds a world by id", async () => {
    const world = { world_id: 1 };
    mock.enqueueResults([world]);
    await expect(repository.findById(1)).resolves.toEqual(world);
  });

  it("creates a world", async () => {
    const world = { world_id: 2 };
    mock.enqueueResults([world]);
    await expect(repository.create(1, "Maa", "World", 1)).resolves.toEqual(
      world
    );
  });

  it("updates a world", async () => {
    const world = { world_id: 2 };
    mock.enqueueResults([world]);
    await expect(repository.update(2, "Uusi", "New", 2)).resolves.toEqual(
      world
    );
  });

  it("deletes a world without active quizzes", async () => {
    const world = { world_id: 2 };
    mock.enqueueResults([], [world]);
    await expect(repository.softDelete(2)).resolves.toEqual({
      kind: "deleted",
      world,
    });
  });

  it("reports a missing world", async () => {
    mock.enqueueResults([], [], []);
    await expect(repository.softDelete(99)).resolves.toEqual({
      kind: "not-found",
    });
  });

  it("reports active quizzes that prevent deletion", async () => {
    mock.enqueueResults([], [], [{ world_id: 2 }], [{ quizCount: 3 }]);
    await expect(repository.softDelete(2)).resolves.toEqual({
      kind: "has-active-quizzes",
      count: 3,
    });
  });
});
