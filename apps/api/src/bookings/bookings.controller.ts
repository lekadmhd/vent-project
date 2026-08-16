import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { BookingStatus, UserRole } from '../common/types/enums';
import { CreateBookingDto } from './dto/booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post(':apartmentId')
  @Roles(UserRole.TENANT, UserRole.SUPER_ADMIN)
  async create(
    @CurrentUser() tenant: AuthUser,
    @Param('apartmentId') apartmentId: string,
    @Body() dto: CreateBookingDto,
    @Req() req: Request,
  ) {
    return this.bookingsService.create(tenant, apartmentId, dto, req);
  }

  @Get('mine')
  @Roles(UserRole.TENANT, UserRole.SUPER_ADMIN)
  async mine(@CurrentUser() tenant: AuthUser) {
    return this.bookingsService.listForTenant(tenant);
  }

  @Get('landlord')
  @Roles(UserRole.LANDLORD, UserRole.SUPER_ADMIN)
  async landlord(@CurrentUser() landlord: AuthUser) {
    return this.bookingsService.listForLandlord(landlord);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.bookingsService.findByTenant(user, id);
  }

  @Patch(':id/status')
  async setStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Req() req: Request,
  ) {
    return this.bookingsService.setStatus(actor, id, status, req);
  }
}
