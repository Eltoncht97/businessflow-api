import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { defer, firstValueFrom, timeout } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<{ status: 'ok' }> {
    try {
      await firstValueFrom(
        defer(() => this.prisma.$queryRaw`SELECT 1`).pipe(timeout(3000)),
      );
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
