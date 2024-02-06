import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UsersRepository } from 'src/users/users.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { RedisProvider } from 'src/redis/redis.provider';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    UsersRepository,
    JwtService,
    RedisService,
    RedisProvider,
  ],
})
export class AuthModule {}
