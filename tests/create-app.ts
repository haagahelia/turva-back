import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { corsOptions } from "../src/config/cors";

export const createApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors(corsOptions);
  await app.init();
  return app;
};
