import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const originPort = 4200; // PORT frontend [Angular];

  console.log('process.env.PORT :', process.env.PORT);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: `http://localhost:${process.env.FRONT_END_PORT}`,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
