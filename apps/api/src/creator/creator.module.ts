import { Module } from '@nestjs/common';
import { CreatorController } from './controllers/creator.controller';
import { CreatorService } from './services/creator.service';
import { RequestService } from './request/services/request.service';
import { RequestModule } from './request/request.module';

@Module({
  controllers: [CreatorController],
  providers: [CreatorService, RequestService],
  imports: [RequestModule]
})
export class CreatorModule {}
