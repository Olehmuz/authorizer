import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { registerCredentials } from './stumbs/register-user.stumb';
import { createUserDTO, createUsersDTO } from './stumbs/create-user-dto.stumb';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let access_token;
  let user;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await prisma.$connect();

    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerCredentials);

    expect(authResponse.status).toBe(201);
    expect(authResponse.body).toHaveProperty('access_token');

    access_token = authResponse.body.access_token;
  });

  it('/users (post)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${access_token}`)
      .send(createUserDTO);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(createUserDTO);

    user = response.body;
  });

  it('/users (get one by ID)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${access_token}`);

    expect(response.body.id).toBe(user.id);
  });

  it('/users (patch)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .set('Authorization', `Bearer ${access_token}`)
      .send({ name: 'new name' });

    expect(response.body.name).toBe('new name');
  });

  it('/users (delete)', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${access_token}`);

    expect(response.status).toBe(200);
  });

  it('/users (get)', async () => {
    const usersPromises = createUsersDTO.map(async (user) => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${access_token}`)
        .send(user);
    });

    const createdUsers = await Promise.all(usersPromises);
    const createdUserEmails = createdUsers.map((user) => user.body.email);

    const fetchedUsers = await request(app.getHttpServer())
      .get('/users')
      .then((res) => res.body);

    const foundUsers = fetchedUsers.filter((user) =>
      createdUserEmails.includes(user.email),
    );

    expect(foundUsers.length).toBe(2);

    const deletePromises = createdUsers.map(async (user) => {
      return prisma.user.delete({ where: { email: user.body.email } });
    });

    await Promise.all(deletePromises);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: registerCredentials.email } });

    await prisma.$disconnect();
    await app.close();
  });
});
