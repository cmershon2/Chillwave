import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchemaForEnv } from './config/environment-variables';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    QueueModule,
  ],
  providers: [],
})
export class AppModule {}
