import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DiscordStrategy } from './utils/DiscordStrategy';

@Module({
  controllers: [AuthController],
  providers: [DiscordStrategy]
})
export class AuthModule {}
