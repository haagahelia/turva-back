import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { VerificationService } from "../../services/verification.service";
import type { AuthRequest } from "../auth-request";
import { ROLES_KEY, type Role } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verification: VerificationService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }

    const user = context.switchToHttp().getRequest<AuthRequest>().user;
    if (!user) {
      throw new UnauthorizedException({ error: "No authenticated user" });
    }

    if (roles.includes("admin")) {
      await this.verification.verifyAdminUser(user);
    }
    return true;
  }
}
