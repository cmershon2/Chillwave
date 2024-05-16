import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';

@Module({
  providers: [ProfileService]
})
export class ProfileModule {}
