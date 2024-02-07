import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { AccessGuard } from './../auth/guards/at.guard';
import { RedisProvider } from './../redis/redis.provider';
import { RedisService } from './../redis/redis.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { PrismaService } from './../common/prisma.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let usersService: UsersService;
  const mockUsersRepository = {
    createUser: jest.fn((dto: CreateUserDto): Promise<User> => {
      return Promise.resolve({
        id: 'a-unique-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: dto.email,
        name: dto.name,
        hashedPassword: 'hashedPasswordExample',
        role: 'USER',
        ...dto,
      });
    }),

    updateUser: jest.fn((id: string, dto: UpdateUserDto): Promise<User> => {
      return Promise.resolve({
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: dto.email,
        name: dto.name,
        hashedPassword: 'hashedPasswordExample',
        role: 'USER',
        ...dto,
      });
    }),

    deleteUser: jest.fn((id: string): Promise<User> => {
      return Promise.resolve({
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'deleted@example.com',
        name: 'Deleted User',
        hashedPassword: 'hashedPasswordExample',
        role: 'USER',
      });
    }),

    findUserByFilter: jest.fn((filter: any): Promise<User | null> => {
      if (filter.email === 'existing@example.com') {
        return Promise.resolve({
          id: 'existing-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          email: filter.email,
          name: 'Existing User',
          hashedPassword: 'hashedPasswordExample',
          role: 'USER',
        });
      } else {
        return Promise.resolve(null);
      }
    }),

    findUserById: jest.fn((id: string): Promise<User | null> => {
      if (id === 'existing-id') {
        return Promise.resolve({
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'existing@example.com',
          name: 'Existing User',
          hashedPassword: 'hashedPasswordExample',
          role: 'USER',
        });
      } else {
        return Promise.resolve(null);
      }
    }),

    getUsersList: jest.fn((): Promise<User[]> => {
      return Promise.resolve([
        {
          id: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'user1@example.com',
          name: 'User One',
          hashedPassword: 'hashedPasswordExample1',
          role: 'USER',
        },
        {
          id: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'user2@example.com',
          name: 'User Two',
          hashedPassword: 'hashedPasswordExample2',
          role: 'USER',
        },
      ]);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UsersRepository, useValue: mockUsersRepository },
        UsersService,
        PrismaService,
        AccessGuard,
        JwtService,
        RedisService,
        RedisProvider,
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should successfully create a user', async () => {
    const createUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      hashedPassword: 'test',
    };
    expect(await usersService.create(createUserDto)).toMatchObject({
      id: expect.any(String),
      ...createUserDto,
    });
    expect(mockUsersRepository.createUser).toHaveBeenCalledWith(createUserDto);
  });

  it('should return an array of users', async () => {
    await expect((await usersService.findAll()).length).toBe(2);
    expect(mockUsersRepository.getUsersList).toHaveBeenCalled();
  });

  it('should return a user if they exist', async () => {
    const id = 'existing-id';
    await expect(usersService.findOne(id)).resolves.toMatchObject({
      id,
      email: 'existing@example.com',
      name: 'Existing User',
      hashedPassword: 'hashedPasswordExample',
      role: 'USER',
    });
    expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(id);
  });

  it('should return null if user does not exist', async () => {
    const id = 'non-existing';
    await expect(usersService.findOne(id)).resolves.toBeNull();
  });

  it('should update a user', async () => {
    const updateUserDto = {
      name: 'Updated User',
      email: 'updatedemail@gmail.com',
    };
    const id = 'user1';
    await expect(usersService.update(id, updateUserDto)).resolves.toMatchObject(
      {
        id,
        email: updateUserDto.email,
        name: updateUserDto.name,
        hashedPassword: 'hashedPasswordExample',
        role: 'USER',
      },
    );
    expect(mockUsersRepository.updateUser).toHaveBeenCalledWith(
      id,
      updateUserDto,
    );
  });

  it('should remove a user', async () => {
    const id = 'user1';
    await expect(usersService.remove(id)).resolves.toMatchObject({ id });
    expect(mockUsersRepository.deleteUser).toHaveBeenCalledWith(id);
  });

  it('should return a user if they exist by filter', async () => {
    const filter = { email: 'existing@example.com' };
    await expect(usersService.findOneByFilter(filter)).resolves.toMatchObject({
      email: filter.email,
    });
  });

  it('should return null if user does not exist by filter', async () => {
    const filter = { email: '' };
    await expect(usersService.findOneByFilter(filter)).resolves.toBeNull();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });
});
