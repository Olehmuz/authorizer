import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AccessGuard } from 'src/auth/guards/at.guard';
import { JwtService } from '@nestjs/jwt';
import { RedisProvider } from 'src/redis/redis.provider';
import { RedisService } from 'src/redis/redis.service';
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
