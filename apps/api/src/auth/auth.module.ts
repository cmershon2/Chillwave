import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DiscordStrategy } from './utils/DiscordStrategy';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [DiscordStrategy, AuthService]
})
export class AuthModule {}
