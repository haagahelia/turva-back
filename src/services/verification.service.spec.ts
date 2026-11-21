import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ForbiddenException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { EmailOtpRepository } from "../database/repositories/email-otp.repository";
import { UserRepository } from "../database/repositories/user.repository";
import { VerificationService } from "./verification.service";

describe("VerificationService", () => {
  const users = {
    findAdmin: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findByUsername: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  const emailOtps = {
    findLatestByEmail: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let service: VerificationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: UserRepository, useValue: users },
        { provide: EmailOtpRepository, useValue: emailOtps },
      ],
    }).compile();

    service = module.get(VerificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("verifies the matching user through UserRepository", async () => {
    users.findByUsername.mockResolvedValue({
      profile_name: "learner",
      email_address: "learner@example.com",
    });

    await expect(
      service.verifyUser("learner@example.com", "learner")
    ).resolves.toBe(true);
    expect(users.findByUsername).toHaveBeenCalledWith("learner");
  });

  it("rejects a user whose email does not match", async () => {
    users.findByUsername.mockResolvedValue({
      profile_name: "learner",
      email_address: "other@example.com",
    });

    await expect(
      service.verifyUser("learner@example.com", "learner")
    ).resolves.toBe(false);
  });

  it("returns false when no OTP exists", async () => {
    emailOtps.findLatestByEmail.mockResolvedValue(undefined);

    await expect(
      service.verifyPin("learner@example.com", "123456")
    ).resolves.toBe(false);
    expect(emailOtps.findLatestByEmail).toHaveBeenCalledWith(
      "learner@example.com"
    );
  });

  it("does not compare an expired OTP", async () => {
    emailOtps.findLatestByEmail.mockResolvedValue({
      otp_code: "hashed-pin",
      valid_until: new Date(0),
    });
    const compare = jest.spyOn(bcrypt, "compare");

    await expect(
      service.verifyPin("learner@example.com", "123456")
    ).resolves.toBe(false);
    expect(compare).not.toHaveBeenCalled();
  });

  it("compares the supplied PIN with an unexpired OTP", async () => {
    emailOtps.findLatestByEmail.mockResolvedValue({
      otp_code: "hashed-pin",
      valid_until: new Date(Date.now() + 60_000),
    });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    await expect(
      service.verifyPin("learner@example.com", "123456")
    ).resolves.toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed-pin");
  });

  it("requires an admin record for admin users", async () => {
    const user = { email: "admin@example.com", username: "admin" };
    users.findAdmin.mockResolvedValue({ user_id: 1 });

    await expect(service.verifyAdminUser(user)).resolves.toEqual(user);
    expect(users.findAdmin).toHaveBeenCalledWith("admin@example.com", "admin");

    users.findAdmin.mockResolvedValue(undefined);
    await expect(service.verifyAdminUser(user)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });
});
