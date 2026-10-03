import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import { parseEnvOrigins } from './utils/parse-env-origins';

const getCorsAllowList = () => {
  return parseEnvOrigins(process.env.CLIENT_URL, process.env.CORS_OTHER_URL);
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // CORS
  const allowList = getCorsAllowList();
  app.enableCors({
    origin: (requestOrigin: string, callback) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }
      if (allowList.includes(requestOrigin)) {
        callback(null, true);
        return;
      }
      //log warning
      callback(null, false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'content-type',
      'authorization',
      'accept',
      'x-requested-with',
    ],
    credentials: true,
  });
  //validationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  //api versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
