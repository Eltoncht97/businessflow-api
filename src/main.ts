import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { Environment } from './config/environment.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const config = app.get(ConfigService<Environment, true>);
  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API listening on port ${port}`, 'Bootstrap');
}
await bootstrap();
