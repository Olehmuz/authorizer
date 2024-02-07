import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AccessGuard } from './../auth/guards/at.guard';
import { PrismaService } from './../common/prisma.service';
import { RedisProvider } from './../redis/redis.provider';
import { RedisService } from './../redis/redis.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    create: jest.fn((createUserDto: CreateUserDto) =>
      Promise.resolve({
        id: 'any-unique-id',
        ...createUserDto,
      }),
    ),
    findOneByFilter: jest.fn((filter: any) =>
      Promise.resolve({
        id: 'any-specific-id-based-on-filter',
        ...filter,
      }),
    ),
    findAll: jest.fn(() =>
      Promise.resolve([
        { id: 'user1', name: 'User One', email: 'userone@example.com' },
        { id: 'user2', name: 'User Two', email: 'usertwo@example.com' },
      ]),
    ),
    findOne: jest.fn((id: string) =>
      Promise.resolve({
        id,
        name: `User ${id}`,
        email: `${id}@example.com`,
      }),
    ),
    update: jest.fn((id: string, updateUserDto: UpdateUserDto) =>
      Promise.resolve({
        id,
        ...updateUserDto,
      }),
    ),
    remove: jest.fn((id: string) =>
      Promise.resolve({
        id,
        name: `Deleted User ${id}`,
        email: `${id}@example.com`,
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        UsersRepository,
        PrismaService,
        AccessGuard,
        JwtService,
        RedisService,
        RedisProvider,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
