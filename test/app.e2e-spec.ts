import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { STORAGE_PROVIDER } from './../src/files/interfaces/storage-provider.interface';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/users/user.entity';
import { File } from './../src/files/file.entity';
import * as bcrypt from 'bcrypt';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  const mockStorageProvider = {
    upload: jest.fn(),
    delete: jest.fn(),
    stat: jest.fn(),
  };

  // In-memory DB
  const users: User[] = [];
  const files: File[] = [];

  const mockUsersRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation(async (user) => {
      const newUser = { ...user, id: `user-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
      users.push(newUser);
      return newUser;
    }),
    findOne: jest.fn().mockImplementation(async ({ where }) => {
      if (where.email) {
        return users.find(u => u.email === where.email) || null;
      }
      if (where.id) {
        return users.find(u => u.id === where.id) || null;
      }
      return null;
    }),
  };

  // Override bcrypt to just work (optional, but real bcrypt is fine too)

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(STORAGE_PROVIDER)
      .useValue(mockStorageProvider)
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUsersRepository)
      .overrideProvider(getRepositoryToken(File))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueEmail = `test-${Date.now()}@example.com`;
  const password = 'password123';
  let jwtToken: string;

  it('Signup User', () => {
    const query = `
      mutation {
        signup(signupInput: {
          email: "${uniqueEmail}",
          password: "${password}"
        }) {
          accessToken
          user {
            id
            email
          }
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        if (res.body.errors) {
          console.error('Signup Error:', JSON.stringify(res.body.errors, null, 2));
        }
        expect(res.body.data.signup.user.email).toEqual(uniqueEmail);
        expect(res.body.data.signup.accessToken).toBeDefined();
        jwtToken = res.body.data.signup.accessToken;
      });
  });

  it('Login User', () => {
    const query = `
      mutation {
        login(loginInput: {
          email: "${uniqueEmail}",
          password: "${password}"
        }) {
          accessToken
          user {
            email
          }
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        if (res.body.errors) {
          console.error('Login Error:', JSON.stringify(res.body.errors, null, 2));
        }
        expect(res.body.data.login.accessToken).toBeDefined();
        jwtToken = res.body.data.login.accessToken;
      });
  });

  it('Query Me (Protected)', () => {
    const query = `
      query {
        me {
          id
          email
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ query })
      .expect(200)
      .expect((res) => {
        if (res.body.errors) {
          console.error('Me Query Error:', JSON.stringify(res.body.errors, null, 2));
        }
        expect(res.body.data.me).toBeDefined();
        expect(res.body.data.me.email).toEqual(uniqueEmail);
      });
  });
});
