import { Test } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { Body, Controller, Post } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { IsString } from 'class-validator';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

class ValidationProbeDto {
  @IsString()
  name!: string;
}

@Controller('validation-probe')
class ValidationProbeController {
  @Post()
  create(@Body() body: ValidationProbeDto): ValidationProbeDto {
    return body;
  }
}

describe('Application HTTP configuration', () => {
  let app: INestApplication;
  const query = jest.fn<() => Promise<unknown>>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ValidationProbeController],
    })
      .overrideProvider(PrismaService)
      .useValue({ $queryRaw: query })
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds over HTTP without querying PostgreSQL', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
    expect(query).not.toHaveBeenCalled();
  });

  it('exposes database readiness without a prefix or version', async () => {
    query.mockResolvedValueOnce([{ '?column?': 1 }]);
    const response = await request(app.getHttpServer())
      .get('/ready')
      .expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns 503 without database error details', async () => {
    query.mockRejectedValueOnce(new Error('sensitive connection details'));
    const response = await request(app.getHttpServer())
      .get('/ready')
      .expect(503);
    expect(response.body).toEqual({
      statusCode: 503,
      message: 'Database unavailable',
      error: 'Service Unavailable',
    });
  });

  it('returns standard DTO validation details', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/validation-probe')
      .send({ name: 123, unexpected: true })
      .expect(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.arrayContaining([
        'name must be a string',
        'property unexpected should not exist',
      ]),
    });
  });
});
