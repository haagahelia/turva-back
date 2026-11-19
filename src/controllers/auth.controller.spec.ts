import { Test, TestingModule } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { AuthController } from "./auth.controller";
import { pool } from "../config/db";
import * as verification from "../utils/verification";
import * as pinGenerator from "../utils/pinGenerator";
import * as tokenGenerator from "../utils/tokenGenerator";
import * as emailer from "../utils/emailer";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();
    controller = module.get(AuthController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects missing registration fields", async () => {
    await expect(controller.registerUser({})).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("rejects an invalid registration email", async () => {
    jest.spyOn(verification, "validateEmail").mockReturnValue(false);
    await expect(
      controller.registerUser({
        username: "learner",
        email: "bad",
        organizationId: 1,
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("registers a new user", async () => {
    jest.spyOn(verification, "validateEmail").mockReturnValue(true);
    jest
      .spyOn(pool, "query")
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    await expect(
      controller.registerUser({
        username: "learner",
        email: "learner@example.com",
        organizationId: 1,
      })
    ).resolves.toEqual({ message: "Account created!" });
  });

  it("rejects a duplicate registration", async () => {
    jest.spyOn(verification, "validateEmail").mockReturnValue(true);
    jest.spyOn(verification, "verifyUser").mockResolvedValue(true);
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ existing_profile_name: "learner" }],
      rowCount: 1,
    } as never);

    await expect(
      controller.registerUser({
        username: "learner",
        email: "learner@example.com",
        organizationId: 1,
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects login requests without a username", async () => {
    await expect(
      controller.requestLoginCode({ email: "learner@example.com" })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects login requests without an email", async () => {
    await expect(
      controller.requestLoginCode({ username: "learner" })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("sends a login pin for valid credentials", async () => {
    jest.spyOn(verification, "validateEmail").mockReturnValue(true);
    jest.spyOn(verification, "verifyUser").mockResolvedValue(true);
    jest.spyOn(pinGenerator, "generatePin").mockReturnValue("123456");
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed-pin" as never);
    jest.spyOn(emailer, "sendEmail").mockResolvedValue();
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 1 } as never);

    await expect(
      controller.requestLoginCode({
        username: "learner",
        email: "learner@example.com",
      })
    ).resolves.toEqual({
      message: "Login email sent to learner@example.com",
    });
  });

  it("rejects login for unknown credentials", async () => {
    jest.spyOn(verification, "validateEmail").mockReturnValue(true);
    jest.spyOn(verification, "verifyUser").mockResolvedValue(false);

    await expect(
      controller.requestLoginCode({
        username: "learner",
        email: "learner@example.com",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects verification without a code", async () => {
    await expect(controller.verifyLoginCode({})).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns a token for a valid login code", async () => {
    jest.spyOn(verification, "verifyPin").mockResolvedValue(true);
    jest.spyOn(tokenGenerator, "generateToken").mockReturnValue("test-token");

    await expect(
      controller.verifyLoginCode({
        email: "learner@example.com",
        username: "learner",
        verificationCode: "123456",
      })
    ).resolves.toEqual({
      message: "Login successful!",
      token: "test-token",
    });
  });

  it("rejects an invalid login code", async () => {
    jest.spyOn(verification, "verifyPin").mockResolvedValue(false);

    await expect(
      controller.verifyLoginCode({
        email: "learner@example.com",
        username: "learner",
        verificationCode: "wrong",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
