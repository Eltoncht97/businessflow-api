import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API process health' })
  @ApiResponse({ status: 200, description: 'The API process is running' })
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
