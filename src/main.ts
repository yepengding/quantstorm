import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'node:path';
import { LoggerService } from './core/logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  app.useLogger(app.get(LoggerService));

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'),
  });

  const doc_config = new DocumentBuilder()
    .setTitle('Quantstorm API')
    .setDescription('The Quantstorm API description')
    .setVersion('0.0.1')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, doc_config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(8888, '0.0.0.0');
}

bootstrap();
