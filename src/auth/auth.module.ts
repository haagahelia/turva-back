import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JWT_SECRET_TOKEN } from "../infrastructure/infrastructure.constants";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { ServicesModule } from "../services/services.module";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    InfrastructureModule,
    ServicesModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [InfrastructureModule],
      inject: [JWT_SECRET_TOKEN],
      useFactory: (jwtSecret: string) => ({
        secret: jwtSecret,
        signOptions: { expiresIn: "3d" },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
