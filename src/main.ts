import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { version } from "../package.json";
import { AppModule } from "./app.module";
import { corsOptions } from "./config/cors";
import { connectDB } from "./config/db";

async function bootstrap() {
  await connectDB();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors(corsOptions);

  if (process.env.ENABLE_SWAGGER === "true") {
    const config = new DocumentBuilder()
      .setTitle("REST API Docs")
      .setVersion(version)
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "bearerAuth"
      )
      .addSecurityRequirements("bearerAuth")
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
