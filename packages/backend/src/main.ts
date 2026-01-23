import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const originPort = 4200; // PORT Angular;

  console.log('process.env.PORT : ', process.env.PORT);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: `http://localhost:${originPort}`,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
