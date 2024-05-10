import { Module } from '@nestjs/common';
import { RequestController } from './controllers/request.controller';

@Module({
  controllers: [RequestController]
})
export class RequestModule {}
