import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const currentPort = 3000; // PORT NestJS;
  const originPort = 33333; // PORT Angular;

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: `http://localhost:${originPort}`,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? currentPort);
}

bootstrap();
