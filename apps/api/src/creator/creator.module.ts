import { Module } from '@nestjs/common';
import { CreatorController } from './controllers/creator.controller';
import { CreatorService } from './services/creator.service';
import { RequestService } from './request/services/request.service';
import { RequestModule } from './request/request.module';
import { EmailModule } from '../email/email.module';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  controllers: [CreatorController],
  providers: [CreatorService, RequestService],
  imports: [RequestModule, EmailModule, PersistenceModule]
})
export class CreatorModule {}
