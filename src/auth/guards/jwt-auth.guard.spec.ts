import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { Controller, Get, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import type { AuthUser } from "../auth-user";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Public } from "../decorators/public.decorator";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { JwtStrategy } from "../jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth-test")
class AuthTestController {
  @Get("protected")
  getProtected(@CurrentUser() user: AuthUser) {
    return { email: user.email };
  }

  @Get("public")
  @Public()
  getPublic() {
    return { public: true };
  }
}

@Module({
  imports: [
    InfrastructureModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  controllers: [AuthTestController],
  providers: [JwtStrategy, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
class AuthTestModule {}

describe("JwtAuthGuard", () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const secret = "auth-guard-test-secret";
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    token = new JwtService({ secret }).sign({
      email: "learner@example.com",
      username: "learner",
    });
  });

  afterAll(async () => {
    await app.close();
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it("allows routes marked public without a token", async () => {
    const response = await request(app.getHttpServer())
      .get("/auth-test/public")
      .expect(200);

    expect(response.body).toEqual({ public: true });
  });

  it("authenticates bearer tokens and exposes the validated user", async () => {
    const response = await request(app.getHttpServer())
      .get("/auth-test/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ email: "learner@example.com" });
  });

  it("rejects protected routes without a valid bearer token", async () => {
    await request(app.getHttpServer()).get("/auth-test/protected").expect(401);
    await request(app.getHttpServer())
      .get("/auth-test/protected")
      .set("Authorization", "Basic invalid")
      .expect(401);
  });
});
