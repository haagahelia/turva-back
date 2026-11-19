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
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { UserController } from "./user.controller";
import { pool } from "../config/db";
import * as verification from "../utils/verification";

describe("UserController", () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();
    controller = module.get(UserController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the authenticated user's profile", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
      username: "learner",
    });
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [
        {
          user_id: 7,
          profile_name: "learner",
          profile_picture_url: "/learner.png",
          email_address: "learner@example.com",
          role: "admin",
        },
      ],
      rowCount: 1,
    } as never);

    await expect(controller.getProfile("Bearer token")).resolves.toEqual({
      userId: 7,
      profileName: "learner",
      profilePictureUrl: "/learner.png",
      email: "learner@example.com",
      role: "admin",
    });
  });

  it("throws not found for an unknown user", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "missing@example.com",
      username: "missing",
    });
    jest
      .spyOn(pool, "query")
      .mockResolvedValue({ rows: [], rowCount: 0 } as never);

    await expect(controller.getProfile("Bearer token")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("rejects a token payload without an email", async () => {
    jest
      .spyOn(verification, "verifyToken")
      .mockReturnValue({ username: "learner" });

    await expect(controller.getProfile("Bearer token")).rejects.toBeInstanceOf(
      HttpException
    );
  });

  it("maps database failures to internal server errors", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
    });
    jest
      .spyOn(pool, "query")
      .mockRejectedValue(new Error("database down") as never);

    await expect(controller.getProfile("Bearer token")).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
  });
});
