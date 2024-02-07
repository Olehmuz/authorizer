import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { loginUserDTO, registerUserDTO } from './stumbs/register-user.stumb';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let access_token;
  let refresh_token;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await prisma.$connect();
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerUserDTO);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');
  });

  it('/auth/login (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerUserDTO);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginUserDTO);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');

    access_token = response.body.access_token;
    refresh_token = response.body.refresh_token;
  });

  it('/auth/refresh (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refresh_token}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');

    access_token = response.body.access_token;
    refresh_token = response.body.refresh_token;
  });

  it('/auth/profile (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${access_token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('sub');
    expect(response.body).toHaveProperty('role');
  });

  it('/auth/logout (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${access_token}`);

    expect(response.status).toBe(201);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: registerUserDTO.email } });

    await prisma.$disconnect();
    await app.close();
  });
});
