import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { corsOptions } from "./config/cors";
import { connectDB } from "./config/db";
import { version } from "../package.json";

async function bootstrap(): Promise<void> {
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
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document, {
      jsonDocumentUrl: "docs.json",
    });
  }
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}

bootstrap().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
