import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReadinessService } from './readiness.service.js';

@ApiTags('health')
@Controller({ path: 'ready', version: VERSION_NEUTRAL })
export class ReadinessController {
  constructor(private readonly readiness: ReadinessService) {}

  @Get()
  @ApiOperation({ summary: 'Check database availability' })
  @ApiResponse({ status: 200, description: 'The database is available' })
  @ApiResponse({ status: 503, description: 'The database is unavailable' })
  getReadiness(): Promise<{ status: 'ok' }> {
    return this.readiness.check();
  }
}
