import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
    initializeTransactionalContext,
    StorageDriver,
} from 'typeorm-transactional';

async function bootstrap() {
    initializeTransactionalContext({
        storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
    });
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    const config = new DocumentBuilder()
        .setTitle('Nevise Negar')
        .setDescription('API description')
        .setVersion('1.0')
        .addBearerAuth(
            {
                bearerFormat: 'Bearer ',
                type: 'http',
                name: 'authorization',
                in: 'header',
            },
            'user-auth',
        )
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
    });
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    await app.listen(3000);
}
bootstrap();
