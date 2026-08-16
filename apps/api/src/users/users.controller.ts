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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/types/enums';
import { ModerateKycDto, UpdateKycDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async profile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user);
  }

  @Post('me/kyc')
  async updateKyc(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateKycDto,
    @Req() req: Request,
  ) {
    return this.usersService.updateKyc(user, dto, req);
  }

  @Get()
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN)
  async list(@CurrentUser() actor: AuthUser) {
    return this.usersService.listUsers(actor);
  }

  @Get(':id/kyc')
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN)
  async viewKyc(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.usersService.viewKyc(actor, id, req);
  }

  @Patch(':id/kyc')
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN)
  async moderateKyc(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: ModerateKycDto,
    @Req() req: Request,
  ) {
    return this.usersService.moderateKyc(actor, id, dto, req);
  }
}
