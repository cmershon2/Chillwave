import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchemaForEnv } from './config/environment-variables';
import { QueueModule } from './queue/queue.module';
import { S3ClientModule } from './s3-client/s3-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    QueueModule,
    S3ClientModule,
  ],
  providers: [],
})
export class AppModule {}
