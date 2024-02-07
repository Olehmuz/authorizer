import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisProvider } from './../redis/redis.provider';
import { RedisService } from './../redis/redis.service';
import { AccessGuard } from './../auth/guards/at.guard';
import { PrismaService } from './../common/prisma.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    PrismaService,
    AccessGuard,
    JwtService,
    RedisService,
    RedisProvider,
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
