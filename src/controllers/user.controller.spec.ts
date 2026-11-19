import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { HttpException, NotFoundException } from "@nestjs/common";
import { UserService } from "../services/user.service";
import * as verification from "../utils/verification";
import { UserController } from "./user.controller";

describe("UserController", () => {
  const users = {
    findProfile: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };
  let controller: UserController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: users }],
    }).compile();

    controller = module.get(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("returns the authenticated user's profile", async () => {
    jest.spyOn(verification, "verifyToken").mockReturnValue({
      email: "learner@example.com",
      username: "learner",
    });
    users.findProfile.mockResolvedValue({
      user_id: 7,
      profile_name: "learner",
      profile_picture_url: "/learner.png",
      email_address: "learner@example.com",
      role: "admin",
    });

    await expect(controller.getProfile("Bearer token")).resolves.toEqual({
      userId: 7,
      profileName: "learner",
      profilePictureUrl: "/learner.png",
      email: "learner@example.com",
      role: "admin",
    });
    expect(users.findProfile).toHaveBeenCalledWith(
      "learner@example.com",
      "learner"
    );
  });

  it("rejects token payloads without an email", async () => {
    jest
      .spyOn(verification, "verifyToken")
      .mockReturnValue({ username: "learner" });

    await expect(controller.getProfile("Bearer token")).rejects.toBeInstanceOf(
      HttpException
    );
    expect(users.findProfile).not.toHaveBeenCalled();
  });

  it("returns not found when the profile does not exist", async () => {
    jest
      .spyOn(verification, "verifyToken")
      .mockReturnValue({ email: "missing@example.com" });
    users.findProfile.mockResolvedValue(undefined);

    await expect(controller.getProfile("Bearer token")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
