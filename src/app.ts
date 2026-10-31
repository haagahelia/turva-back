import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { corsOptions } from "./config/cors";
import swaggerDocs from "./utils/swagger";

const createApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors(corsOptions);
  await app.init();

  if (process.env.ENABLE_SWAGGER === "true") {
    swaggerDocs(
      app.getHttpAdapter().getInstance(),
      Number(process.env.PORT) || 3000
    );
  }

  return app;
};

export default createApp;
