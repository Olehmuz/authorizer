import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcrypt';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RedisService } from './../redis/redis.service';
import { UsersRepository } from './../users/users.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const mockUserId = 'existing-id';

  const password = '120533333';
  const email = 'existing@example.com';
  const unexistedUserEmail = 'unexisting@example.com';

  const mockUsersRepository = {
    createUser: jest.fn((dto: CreateUserDto): Promise<User> => {
      return Promise.resolve({
        id: 'a-unique-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: dto.email,
        name: dto.name,
        hashedPassword: hashSync(password, 10),
        role: 'USER',
        ...dto,
      });
    }),

    findUserByFilter: jest.fn((filter: any): Promise<User | null> => {
      if (
        filter.email === 'existing@example.com' ||
        filter.id === 'existing-id'
      ) {
        return Promise.resolve({
          id: 'existing-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          email: filter.email,
          name: 'Existing User',
          hashedPassword: hashSync(password, 10),
          role: 'USER',
        });
      } else {
        return Promise.resolve(null);
      }
    }),
  };

  const mockRedisService = {
    get: jest.fn((key: string) => {
      const mockData = {
        sampleKey: 'sampleValue',
      };
      return Promise.resolve(mockData[key] || null);
    }),

    set: jest.fn(() => {
      return Promise.resolve();
    }),

    del: jest.fn(() => {
      return Promise.resolve();
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: RedisService, useValue: mockRedisService },
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('signIn should return access token', async () => {
    const tokens = await service.signIn({
      email,
      password,
    });
    expect(tokens).toHaveProperty('access_token');
    expect(tokens).toHaveProperty('refresh_token');
  });

  it('signIn should return error if user not found', async () => {
    expect(
      service.signIn({
        email: 'randomemail@gmail.com',
        password,
      }),
    ).rejects.toThrow('User with such email does not exist.');
  });

  it('signIn should return error if password is incorrect', async () => {
    expect(
      service.signIn({
        email,
        password: 'randomWrongPassword',
      }),
    ).rejects.toThrow('Incorrect password.');
  });

  it('signUp should return access token', async () => {
    const tokens = await service.signUp({
      email: unexistedUserEmail,
      password,
    });
    expect(tokens).toHaveProperty('access_token');
    expect(tokens).toHaveProperty('refresh_token');
  });

  it('signUp should return error if user already exists', async () => {
    expect(
      service.signUp({
        email,
        password,
      }),
    ).rejects.toThrow('User with such email already exists.');
  });

  it('logout should return message', async () => {
    const message = await service.logout(mockUserId);
    expect(message).toBe('logouted!');
  });

  it('refresh should return new tokens', async () => {
    const tokens = await service.refresh(mockUserId);
    expect(tokens).toHaveProperty('access_token');
    expect(tokens).toHaveProperty('refresh_token');
  });

  it('refresh should return error if user is not authorized', async () => {
    expect(service.refresh('')).rejects.toThrow('User is not authorized.');
  });

  it('refresh should return error if user does not exist', async () => {
    expect(service.refresh('non-existing')).rejects.toThrow(
      'User does not exist.',
    );
  });

  it('generateTokens should return tokens', async () => {
    const tokens = await service.generateTokens({
      id: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      email,
      name: 'Existing User',
      hashedPassword: hashSync(password, 10),
      role: 'USER',
    });
    expect(tokens).toHaveProperty('access_token');
    expect(tokens).toHaveProperty('refresh_token');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
