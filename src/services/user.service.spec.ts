import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { UserRepository } from "../database/repositories/user.repository";
import { UserService } from "./user.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("UserService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const users = { findProfile: asyncMock() };
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, { provide: UserRepository, useValue: users }],
    }).compile();
    service = module.get(UserService);
  });

  it("delegates profile lookup to UserRepository", async () => {
    const profile = { user_id: 7 };
    users.findProfile.mockResolvedValue(profile);

    await expect(
      service.findProfile("learner@example.com", "learner")
    ).resolves.toBe(profile);
    expect(users.findProfile).toHaveBeenCalledWith(
      "learner@example.com",
      "learner"
    );
  });
});
