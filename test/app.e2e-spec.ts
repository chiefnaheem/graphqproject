import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { STORAGE_PROVIDER } from './../src/files/interfaces/storage-provider.interface';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  const mockStorageProvider = {
    upload: jest.fn(),
    delete: jest.fn(),
    stat: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(STORAGE_PROVIDER)
      .useValue(mockStorageProvider)
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
        signupUser(signupInput: {
          username: "testuser",
          email: "${uniqueEmail}",
          password: "${password}"
        }) {
          id
          email
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        if (!res.body.data) {
          console.error('Signup Error:', JSON.stringify(res.body, null, 2));
        }
        expect(res.body.data.signupUser).toBeDefined();
        expect(res.body.data.signupUser.email).toEqual(uniqueEmail);
      });
  });

  it('Login User', () => {
    const query = `
      mutation {
        loginUser(loginInput: {
          email: "${uniqueEmail}",
          password: "${password}"
        }) {
          access_token
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        if (!res.body.data) {
          console.error('Login Error:', JSON.stringify(res.body, null, 2));
        }
        expect(res.body.data.loginUser.access_token).toBeDefined();
        jwtToken = res.body.data.loginUser.access_token;
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
      .send({ query })
      // .expect(200) // Removed to see error
      .expect((res) => {
        if (!res.body.data) {
          console.error('Me Query Error:', JSON.stringify(res.body, null, 2));
        }
        expect(res.body.data.me).toBeDefined();
        expect(res.body.data.me.email).toEqual(uniqueEmail);
      });
  });
});
