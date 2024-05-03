import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { IsUserAlreadyExist } from './validators/is-user-already-exist.validator';

@Module({
  imports: [PersistenceModule],
  providers: [UserService, IsUserAlreadyExist],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
