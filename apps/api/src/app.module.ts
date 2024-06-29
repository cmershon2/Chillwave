import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchemaForEnv } from './config/environment-variables';
import { PersistenceModule } from './persistence/persistence.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CreatorModule } from './creator/creator.module';
import { EmailModule } from './email/email.module';
import { ImageModule } from './image/image.module';
import { UploadModule } from './upload/upload.module';
import { QueueModule } from './queue/queue.module';
import { VideoEncodingModule } from './upload/video-encoding/video-encoding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    PersistenceModule,
    AuthModule,
    UserModule,
    CreatorModule,
    EmailModule,
    ImageModule,
    UploadModule,
    QueueModule,
    VideoEncodingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
