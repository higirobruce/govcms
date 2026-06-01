import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  // Security headers.
  app.use(helmet());

  // CORS: allowlist from env in production; permissive in dev.
  const origins = process.env.CORS_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors(
    origins && origins.length > 0
      ? { origin: origins, credentials: true }
      : { origin: true },
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  new Logger("bootstrap").log(`govcms core API → http://localhost:${port}/api`);
}

void bootstrap();
