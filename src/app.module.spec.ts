import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('AppModule Dependencies', () => {
  let app: INestApplication;
  let appService: AppService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    appService = app.get(AppService);
  });

  it('AppService should be defined', () => {
    expect(appService).toBeDefined();
  });

  it('AppService.getHello() should return "Hello World!"', () => {
    expect(appService.getHello()).toBe('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
