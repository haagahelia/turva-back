import { describe, expect, it } from "@jest/globals";
import { MODULE_METADATA } from "@nestjs/common/constants";
import { APP_GUARD } from "@nestjs/core";
import { AppModule } from "../app.module";
import { AuthModule } from "./auth.module";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";
import { ROLES_KEY } from "./decorators/roles.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { AuthController } from "../controllers/auth.controller";
import { CrisisTeamController } from "../controllers/crisis-team.controller";
import { InfoController } from "../controllers/info.controller";
import { PhysicalRewardController } from "../controllers/physical-reward.controller";
import { QuizController } from "../controllers/quiz.controller";
import { QuizResultController } from "../controllers/quiz-result.controller";
import { StatusController } from "../controllers/status.controller";
import { WorldController } from "../controllers/world.controller";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";

describe("authentication access metadata", () => {
  const getHandler = (prototype: object, methodName: string): object => {
    const handler = Object.getOwnPropertyDescriptor(
      prototype,
      methodName
    )?.value;
    if (typeof handler !== "function") {
      throw new Error(`Missing handler: ${methodName}`);
    }
    return handler;
  };

  it("registers both guards globally in the application", () => {
    const appImports: unknown[] = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      AppModule
    );
    const authProviders: unknown[] = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      AuthModule
    );

    expect(appImports).toContain(InfrastructureModule);
    expect(appImports).toContain(AuthModule);
    expect(authProviders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: APP_GUARD, useClass: JwtAuthGuard }),
        expect.objectContaining({ provide: APP_GUARD, useClass: RolesGuard }),
      ])
    );
  });

  it("marks the status, auth, and QR-verification endpoints public", () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, StatusController)).toBe(true);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, AuthController)).toBe(true);
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        getHandler(PhysicalRewardController.prototype, "verifyPhysicalReward")
      )
    ).toBe(true);
  });

  it("marks management mutations as admin-only", () => {
    const adminHandlers: Array<[object, string]> = [
      [InfoController.prototype, "createInfoPage"],
      [InfoController.prototype, "updateInfoPage"],
      [InfoController.prototype, "deleteInfoPage"],
      [QuizController.prototype, "createQuiz"],
      [QuizController.prototype, "updateQuiz"],
      [QuizController.prototype, "deleteQuiz"],
      [WorldController.prototype, "createWorld"],
      [WorldController.prototype, "updateWorld"],
      [WorldController.prototype, "deleteWorld"],
      [CrisisTeamController.prototype, "createCrisisTeamContact"],
      [CrisisTeamController.prototype, "updateCrisisTeamContact"],
      [CrisisTeamController.prototype, "deleteCrisisTeamContact"],
    ];

    for (const [prototype, methodName] of adminHandlers) {
      expect(
        Reflect.getMetadata(ROLES_KEY, getHandler(prototype, methodName))
      ).toEqual(["admin"]);
    }
  });

  it("leaves learner-owned write actions authenticated-user only", () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getHandler(QuizResultController.prototype, "saveQuizResult")
      )
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getHandler(PhysicalRewardController.prototype, "claimPhysicalReward")
      )
    ).toBeUndefined();
  });
});
