import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { AuthUser } from "../auth-user";
import type { AuthRequest } from "../auth-request";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const user = context.switchToHttp().getRequest<AuthRequest>().user;
    if (!user) {
      throw new UnauthorizedException({ error: "No authenticated user" });
    }
    return user;
  }
);
