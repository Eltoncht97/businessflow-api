import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ReadinessController } from './readiness.controller.js';
import { ReadinessService } from './readiness.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController, ReadinessController],
  providers: [ReadinessService],
})
export class HealthModule {}
