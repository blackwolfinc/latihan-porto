import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

@ApiTags('subscription')
@ApiBearerAuth()
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plan')
  @ApiOperation({ summary: 'Get current organization plan and limits' })
  getPlan(@Query('organizationId') organizationId: string) {
    return this.subscriptionService.getOrganizationPlan(organizationId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current usage stats vs plan limits' })
  getUsage(@Query('organizationId') organizationId: string) {
    return this.subscriptionService.getUsageStats(organizationId);
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get plan limits configuration' })
  getLimits() {
    const { PLAN_LIMITS } = require('./plan-limits.config');
    return PLAN_LIMITS;
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade organization plan' })
  upgrade(
    @Body() body: { organizationId: string; plan: string },
  ) {
    return this.subscriptionService.upgradePlan(body.organizationId, body.plan);
  }
}
