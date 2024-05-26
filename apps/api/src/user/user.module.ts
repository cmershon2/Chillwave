import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { IsUserAlreadyExist } from './validators/is-user-already-exist.validator';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [UserService, IsUserAlreadyExist],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
