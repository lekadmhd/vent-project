import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/types/enums';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('me')
  async myLogs(@CurrentUser() user: AuthUser) {
    return this.auditService.findByActor(user.sub);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.FINANCE_ADMIN)
  async allLogs(@Req() req: Request) {
    return this.auditService.findAll();
  }
}
