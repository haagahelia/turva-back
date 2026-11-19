import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { StatusController } from "./status.controller";

describe("StatusController", () => {
  let controller: StatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
    }).compile();

    controller = module.get(StatusController);
  });

  it("returns pong from ping", () => {
    expect(controller.ping()).toBe("pong");
  });

  it("returns the JSON greeting from root", () => {
    expect(JSON.parse(controller.root())).toBe("Hello world!");
  });
});
