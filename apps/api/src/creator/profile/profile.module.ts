import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { ProfileController } from './controllers/profile.controller';
import { ImageModule } from '../../image/image.module';

@Module({
  imports: [PersistenceModule, ImageModule],
  controllers: [ProfileController],
  exports: [ProfileService],
  providers: [ProfileService],
})
export class ProfileModule {}
