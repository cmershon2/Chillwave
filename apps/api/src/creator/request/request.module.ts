import { Module } from '@nestjs/common';
import { RequestController } from './controllers/request.controller';
import { EmailModule } from 'src/email/email.module';
import { RequestService } from './services/request.service';

@Module({
  imports:[EmailModule],
  controllers: [RequestController],
  exports:[RequestService],
  providers:[RequestService]
})
export class RequestModule {}
