import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppExceptionFilter } from "./common/filters/app-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { apiReference } from "@scalar/express-api-reference";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // NestJS 라우터보다 먼저 등록해야 동작함
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((req: any, res: any, next: any) => {
    if (req.url === "/" || req.url === "") return res.redirect(302, "/docs");
    if (req.url === "/favicon.ico") return res.status(204).end();
    next();
  });

  const baseUrl = process.env.API_BASE_URL ?? "https://reel-tripapi-production.up.railway.app";
  app.use(
    "/docs",
    apiReference({
      url: `${baseUrl}/api/docs/spec`,
      theme: "kepler",
      darkMode: true,
      defaultOpenAllTags: true,
      pageTitle: "ReeL-Trip API Docs",
    })
  );

  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
  const allowedSuffixes =
    process.env.ALLOWED_ORIGIN_SUFFIXES?.split(",").map((s) => s.trim()) ?? [];

  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (localhostPattern.test(origin)) return callback(null, true);
      if (origin === baseUrl) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (allowedSuffixes.some((suffix) => origin.endsWith(suffix)))
        return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.setGlobalPrefix("api");
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
