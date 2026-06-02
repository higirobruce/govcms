import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { UPLOADS_DIR } from "./media/media.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api");

  // Serve uploaded media (dev: local disk; prod: object storage + CDN).
  app.useStaticAssets(UPLOADS_DIR, { prefix: "/uploads/" });

  // Security headers. crossOriginResourcePolicy relaxed so the admin (other
  // origin) can load media; tighten with a real CDN in production.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

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
