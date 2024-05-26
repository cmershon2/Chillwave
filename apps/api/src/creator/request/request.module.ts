import { Module } from '@nestjs/common';
import { RequestController } from './controllers/request.controller';
import { EmailModule } from '../../email/email.module';
import { RequestService } from './services/request.service';
import { PersistenceModule } from '../../persistence/persistence.module';

@Module({
  imports: [EmailModule, PersistenceModule],
  controllers: [RequestController],
  exports: [RequestService],
  providers: [RequestService],
})
export class RequestModule {}
