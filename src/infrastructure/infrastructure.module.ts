import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JWT_SECRET_TOKEN } from "./infrastructure.constants";

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: JWT_SECRET_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): string => {
        const secret = configService.get<string>("JWT_SECRET");
        if (!secret?.trim()) {
          throw new Error("JWT_SECRET is not configured");
        }
        return secret;
      },
    },
  ],
  exports: [JWT_SECRET_TOKEN],
})
export class InfrastructureModule {}
