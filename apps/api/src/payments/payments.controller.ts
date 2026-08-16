import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentVerificationStatus, UserRole } from '../common/types/enums';
import {
  ApprovePaymentDto,
  RejectPaymentDto,
  SubmitPaymentDto,
} from './dto/payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('bookings/:bookingId')
  @Roles(UserRole.TENANT, UserRole.SUPER_ADMIN)
  async submit(
    @CurrentUser() tenant: AuthUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: SubmitPaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.submit(tenant, bookingId, dto, req);
  }

  @Get('mine')
  @Roles(UserRole.TENANT, UserRole.SUPER_ADMIN)
  async mine(@CurrentUser() tenant: AuthUser) {
    return this.paymentsService.listByTenant(tenant);
  }

  @Get('finance')
  @Roles(UserRole.FINANCE_ADMIN, UserRole.SUPER_ADMIN)
  async financeQueue(
    @Query('status') status?: PaymentVerificationStatus,
  ) {
    return this.paymentsService.listForFinance(status);
  }

  @Patch(':id/approve')
  @Roles(UserRole.FINANCE_ADMIN, UserRole.SUPER_ADMIN)
  async approve(
    @CurrentUser() finance: AuthUser,
    @Param('id') id: string,
    @Body() dto: ApprovePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.approve(finance, id, req, dto);
  }

  @Patch(':id/reject')
  @Roles(UserRole.FINANCE_ADMIN, UserRole.SUPER_ADMIN)
  async reject(
    @CurrentUser() finance: AuthUser,
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.reject(finance, id, dto, req);
  }
}
