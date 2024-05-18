import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { ProfileController } from './controllers/profile.controller';

@Module({
  imports:[PersistenceModule],
  controllers:[ProfileController],
  exports: [ProfileService],
  providers: [ProfileService],
})
export class ProfileModule {}
