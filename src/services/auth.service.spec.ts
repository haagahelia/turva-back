import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ConflictException } from "@nestjs/common";
import { UserRepository } from "../database/repositories/user.repository";
import { EmailOtpRepository } from "../database/repositories/email-otp.repository";
import { AuthService } from "./auth.service";

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe("AuthService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const users = { exists: asyncMock(), create: asyncMock() };
  const emailOtps = { save: asyncMock() };
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: users },
        { provide: EmailOtpRepository, useValue: emailOtps },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it("creates a user if the username and email are available", async () => {
    users.exists.mockResolvedValue(false);
    users.create.mockResolvedValue(undefined);

    await expect(
      service.registerUser(1, "learner", "learner@example.com")
    ).resolves.toBeUndefined();
    expect(users.create).toHaveBeenCalledWith(
      1,
      "learner",
      "learner@example.com"
    );
  });

  it("rejects duplicate usernames or emails", async () => {
    users.exists.mockResolvedValue(true);

    await expect(
      service.registerUser(1, "learner", "learner@example.com")
    ).rejects.toBeInstanceOf(ConflictException);
    expect(users.create).not.toHaveBeenCalled();
  });

  it("saves login codes through the OTP repository", async () => {
    const validUntil = new Date("2030-01-01");
    const createdAt = new Date("2029-12-01");
    emailOtps.save.mockResolvedValue(undefined);

    await service.saveLoginCode(
      "learner@example.com",
      "hash",
      validUntil,
      createdAt
    );

    expect(emailOtps.save).toHaveBeenCalledWith(
      "learner@example.com",
      "hash",
      validUntil,
      createdAt
    );
  });
});
