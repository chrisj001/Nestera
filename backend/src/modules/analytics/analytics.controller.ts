import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AssetAllocationDto } from './dto/asset-allocation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('allocation')
  @ApiOperation({
    summary: 'Get asset allocation breakdown for doughnut chart',
    description:
      'Returns each token held by the authenticated user as a percentage of their total portfolio, sorted highest allocation first.',
  })
  @ApiResponse({
    status: 200,
    description: 'Asset allocation data',
    type: AssetAllocationDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'No Stellar public key linked to account',
  })
  async getAllocation(
    @CurrentUser() user: { id: string; publicKey?: string },
  ): Promise<AssetAllocationDto> {
    if (!user.publicKey) {
      throw new NotFoundException(
        'No Stellar public key linked to this account',
      );
    }
    return this.analyticsService.getAssetAllocation(user.publicKey);
  }
}
