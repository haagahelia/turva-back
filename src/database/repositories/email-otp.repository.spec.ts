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
import { EmailOtpRepository } from "./email-otp.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("EmailOtpRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: EmailOtpRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailOtpRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(EmailOtpRepository);
  });

  it("saves an OTP using Drizzle", async () => {
    mock.enqueueResults([]);
    await expect(
      repository.save(
        "learner@example.com",
        "hash",
        new Date("2030-01-01"),
        new Date("2029-12-01")
      )
    ).resolves.toBeUndefined();
    expect(mock.db.insert).toHaveBeenCalled();
  });

  it("retrieves the latest OTP for an email", async () => {
    const otp = { otp_code: "hash", valid_until: new Date("2030-01-01") };
    mock.enqueueResults([otp]);
    await expect(
      repository.findLatestByEmail("learner@example.com")
    ).resolves.toEqual(otp);
    expect(mock.db.select).toHaveBeenCalled();
  });
});
