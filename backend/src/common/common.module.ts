import { Global, Module } from '@nestjs/common';
import { PiiEncryptionService } from './services/pii-encryption.service';
import { RateLimitMonitorService } from './services/rate-limit-monitor.service';
import { GracefulShutdownService } from './services/graceful-shutdown.service';

@Global()
@Module({
  providers: [RateLimitMonitorService, PiiEncryptionService, GracefulShutdownService],
  exports: [RateLimitMonitorService, PiiEncryptionService, GracefulShutdownService],
})
export class CommonModule {}
