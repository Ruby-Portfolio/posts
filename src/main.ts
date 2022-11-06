import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { pipeConfig } from './config/pipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');

  pipeConfig(app);

  const port = process.env.PORT;
  await app.listen(port);
}
bootstrap();
