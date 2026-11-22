import { Test } from "@nestjs/testing";
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
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { AuthService } from "../services/auth.service";
import { VerificationService } from "../services/verification.service";
import * as emailer from "../utils/emailer";
import * as pinGenerator from "../utils/pinGenerator";
import * as emailValidation from "../utils/email-validation";
import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  const auth = {
    registerUser: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    saveLoginCode: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  const verificationService = {
    verifyUser: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    verifyPin: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  const jwt = {
    sign: jest.fn<(...args: unknown[]) => string>(),
  };
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: VerificationService, useValue: verificationService },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("rejects missing registration fields", async () => {
    await expect(controller.registerUser({})).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(auth.registerUser).not.toHaveBeenCalled();
  });

  it("rejects an invalid registration email", async () => {
    jest.spyOn(emailValidation, "validateEmail").mockReturnValue(false);

    await expect(
      controller.registerUser({
        username: "learner",
        email: "bad",
        organizationId: 1,
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("registers through AuthService", async () => {
    jest.spyOn(emailValidation, "validateEmail").mockReturnValue(true);

    await controller.registerUser({
      username: "learner",
      email: "learner@example.com",
      organizationId: 1,
    });

    expect(auth.registerUser).toHaveBeenCalledWith(
      1,
      "learner",
      "learner@example.com"
    );
  });

  it("propagates duplicate registration from AuthService", async () => {
    jest.spyOn(emailValidation, "validateEmail").mockReturnValue(true);
    auth.registerUser.mockRejectedValue(
      new ConflictException("Email or username already in use")
    );

    await expect(
      controller.registerUser({
        username: "learner",
        email: "learner@example.com",
        organizationId: 1,
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects a login request without a username", async () => {
    await expect(
      controller.requestLoginCode({ email: "learner@example.com" })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects a login request without an email", async () => {
    await expect(
      controller.requestLoginCode({ username: "learner" })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects an invalid login email", async () => {
    jest.spyOn(emailValidation, "validateEmail").mockReturnValue(false);

    await expect(
      controller.requestLoginCode({
        username: "learner",
        email: "bad",
      })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(verificationService.verifyUser).not.toHaveBeenCalled();
  });

  it("rejects login for unknown credentials", async () => {
    jest.spyOn(emailValidation, "validateEmail").mockReturnValue(true);
    verificationService.verifyUser.mockResolvedValue(false);

    await expect(
      controller.requestLoginCode({
        username: "learner",
        email: "learner@example.com",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("saves and emails a login code for valid credentials", async () => {
    jest.spyOn(emailValidation, "validateEmail").mockReturnValue(true);
    verificationService.verifyUser.mockResolvedValue(true);
    jest.spyOn(pinGenerator, "generatePin").mockReturnValue("123456");
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed-pin" as never);
    jest.spyOn(emailer, "sendEmail").mockResolvedValue();

    await expect(
      controller.requestLoginCode({
        username: "learner",
        email: "learner@example.com",
      })
    ).resolves.toEqual({
      message: "Login email sent to learner@example.com",
    });

    expect(auth.saveLoginCode).toHaveBeenCalledWith(
      "learner@example.com",
      "hashed-pin",
      expect.any(Date),
      expect.any(Date)
    );
    expect(emailer.sendEmail).toHaveBeenCalledWith(
      "learner@example.com",
      "123456"
    );
  });

  it("rejects verification without a code", async () => {
    await expect(controller.verifyLoginCode({})).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("returns a token for a verified login code", async () => {
    verificationService.verifyPin.mockResolvedValue(true);
    jwt.sign.mockReturnValue("test-token");

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
    expect(jwt.sign).toHaveBeenCalledWith({
      email: "learner@example.com",
      username: "learner",
    });
  });

  it("rejects an invalid login code", async () => {
    verificationService.verifyPin.mockResolvedValue(false);

    await expect(
      controller.verifyLoginCode({
        email: "learner@example.com",
        username: "learner",
        verificationCode: "wrong",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
