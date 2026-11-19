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
import { UserRepository } from "./user.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("UserRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(UserRepository);
  });

  it("checks whether a username or email already exists", async () => {
    mock.enqueueResults([{ user_id: 1 }]);
    await expect(
      repository.exists("learner", "learner@example.com")
    ).resolves.toBe(true);

    mock.enqueueResults([]);
    await expect(
      repository.exists("new-user", "new@example.com")
    ).resolves.toBe(false);
  });

  it("creates a user", async () => {
    mock.enqueueResults([]);
    await expect(
      repository.create(1, "learner", "learner@example.com")
    ).resolves.toBeUndefined();
    expect(mock.db.insert).toHaveBeenCalled();
  });

  it("finds a profile", async () => {
    const user = { user_id: 1, profile_name: "learner" };
    mock.enqueueResults([user]);
    await expect(
      repository.findProfile("learner@example.com", "learner")
    ).resolves.toEqual(user);
  });

  it("finds an admin", async () => {
    const user = { user_id: 1 };
    mock.enqueueResults([user]);
    await expect(
      repository.findAdmin("admin@example.com", "admin")
    ).resolves.toEqual(user);
  });

  it("finds a user by username", async () => {
    const user = { profile_name: "learner" };
    mock.enqueueResults([user]);
    await expect(repository.findByUsername("learner")).resolves.toEqual(user);
  });

  it("finds an active user id by email", async () => {
    const user = { user_id: 1 };
    mock.enqueueResults([user]);
    await expect(
      repository.findActiveIdByEmail("learner@example.com")
    ).resolves.toEqual(user);
  });
});
