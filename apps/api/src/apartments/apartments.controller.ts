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
import { ApartmentsService } from './apartments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, PropertyStatus } from '../common/types/enums';
import { CreateApartmentDto, SearchApartmentDto } from './dto/apartment.dto';

@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get()
  async search(@Query() filters: SearchApartmentDto) {
    return this.apartmentsService.search(filters);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.SUPER_ADMIN)
  async create(
    @CurrentUser() landlord: AuthUser,
    @Body() dto: CreateApartmentDto,
  ) {
    return this.apartmentsService.create(landlord, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.SUPER_ADMIN)
  async mine(@CurrentUser() landlord: AuthUser) {
    return this.apartmentsService.listByLandlord(landlord);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN)
  async moderate(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body('status') status: PropertyStatus,
    @Req() req: Request,
  ) {
    return this.apartmentsService.moderate(actor, id, status, req);
  }
}
