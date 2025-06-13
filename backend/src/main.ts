import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors();

  // 글로벌 Validation Pipe 설정
  app.useGlobalPipes(new ValidationPipe());

  // 글로벌 에러 핸들링 (모든 에러를 콘솔에 출력)
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log('🚀 Backend server is running on http://localhost:4000');
}
bootstrap();
