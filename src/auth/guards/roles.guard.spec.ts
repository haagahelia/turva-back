import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthUser } from "../auth-user";
import { VerificationService } from "../../services/verification.service";
import type { AuthRequest } from "../auth-request";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  const reflector = new Reflector();
  const verification = {
    verifyAdminUser: jest.fn<(...args: [AuthUser]) => Promise<AuthUser>>(),
  };
  const guard = new RolesGuard(
    reflector,
    verification as unknown as VerificationService
  );
  const handler = () => undefined;
  class TestController {}
  const user = { email: "admin@example.com", username: "admin" };

  const context = (request: {
    headers: AuthRequest["headers"];
    user?: AuthUser;
  }): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => TestController,
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  afterEach(() => {
    Reflect.deleteMetadata(ROLES_KEY, handler);
    jest.clearAllMocks();
  });

  it("allows routes without role metadata", async () => {
    await expect(
      guard.canActivate(context({ headers: {}, user }))
    ).resolves.toBe(true);
    expect(verification.verifyAdminUser).not.toHaveBeenCalled();
  });

  it("uses the current database-backed admin check for admin routes", async () => {
    Reflect.defineMetadata(ROLES_KEY, ["admin"], handler);
    verification.verifyAdminUser.mockResolvedValue(user);

    await expect(
      guard.canActivate(context({ headers: {}, user }))
    ).resolves.toBe(true);
    expect(verification.verifyAdminUser).toHaveBeenCalledWith(user);
  });

  it("rejects non-admin users on admin routes", async () => {
    Reflect.defineMetadata(ROLES_KEY, ["admin"], handler);
    verification.verifyAdminUser.mockRejectedValue(
      new ForbiddenException({ error: "Admin access required" })
    );

    await expect(
      guard.canActivate(context({ headers: {}, user }))
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects missing users on routes requiring a role", async () => {
    Reflect.defineMetadata(ROLES_KEY, ["admin"], handler);

    await expect(
      guard.canActivate(context({ headers: {} }))
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
