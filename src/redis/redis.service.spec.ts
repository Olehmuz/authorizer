import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from './../redis/redis.service';

describe('RedisService', () => {
  let redisService: RedisService;

  const redisStorage = {};

  const mockRedisClient = {
    get: jest.fn((key: string) => {
      const value = redisStorage[key] || null;
      return Promise.resolve(value);
    }),
    set: jest.fn((key: string, value: string, ...args: any[]) => {
      redisStorage[key] = value;

      if (args.length && args[0] === 'EX') {
        const ttl = args[1];
        setTimeout(() => delete redisStorage[key], ttl * 1000);
      }
      return Promise.resolve('OK');
    }),
    del: jest.fn((key: string) => {
      const numberOfDeletedKeys = Object.prototype.hasOwnProperty.call(
        redisStorage,
        key,
      )
        ? 1
        : 0;
      delete redisStorage[key];
      return Promise.resolve(numberOfDeletedKeys);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('should save a value without TTL', async () => {
    await redisService.set('testKey', 'testValue');
    expect(mockRedisClient.set).toHaveBeenCalledWith('testKey', 'testValue');
  });

  it('should save a value with TTL', async () => {
    await redisService.set('testKey', 'testValue', 3600);
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'testKey',
      'testValue',
      'EX',
      3600,
    );
  });

  it('should retrieve the correct value for a key', async () => {
    mockRedisClient.get.mockResolvedValue('storedValue');
    const value = await redisService.get('existingKey');
    expect(mockRedisClient.get).toHaveBeenCalledWith('existingKey');
    expect(value).toBe('storedValue');
  });

  it('should delete a key', async () => {
    mockRedisClient.del.mockResolvedValue(1);
    await redisService.del('keyToDelete');
    expect(mockRedisClient.del).toHaveBeenCalledWith('keyToDelete');
  });
});
