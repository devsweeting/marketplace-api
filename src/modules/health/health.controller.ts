import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private healthCheckService: HealthCheckService,
    private typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    const maxRSS = Number(this.configService.get('health.default.maxRSSMB'));
    const maxHeap = Number(this.configService.get('health.default.maxHeapMB'));

    return this.healthCheckService.check([
      (): HealthIndicatorResult | PromiseLike<HealthIndicatorResult> =>
        this.typeOrmHealthIndicator.pingCheck('database'),
      (): HealthIndicatorResult | PromiseLike<HealthIndicatorResult> =>
        // eslint-disable-next-line no-magic-numbers
        this.memoryHealthIndicator.checkHeap('memory heap', maxHeap * 1024 * 1024),
      (): HealthIndicatorResult | PromiseLike<HealthIndicatorResult> =>
        // eslint-disable-next-line no-magic-numbers
        this.memoryHealthIndicator.checkRSS('memory RSS', maxRSS * 1024 * 1024),
    ]);
  }
}
