import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersRepository } from './../users/users.repository';
import { RedisService } from './../redis/redis.service';
import { RedisProvider } from './../redis/redis.provider';
import { PrismaService } from './../common/prisma.service';
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
