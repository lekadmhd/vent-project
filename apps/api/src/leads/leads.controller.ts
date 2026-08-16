import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, CreateMessageDto, UpdateLeadDto } from './dto/lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.createLead(dto);
  }

  @Get(':id/messages')
  messages(@Param('id') id: string) {
    return this.leadsService.getThread(id);
  }

  @Post(':id/messages')
  guestMessage(@Param('id') id: string, @Body() dto: CreateMessageDto) {
    return this.leadsService.addGuestMessage(id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN)
  list() {
    return this.leadsService.listLeads();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN)
  detail(@Param('id') id: string) {
    return this.leadsService.getLead(id);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN)
  reply(@Param('id') id: string, @Body() dto: CreateMessageDto) {
    return this.leadsService.adminReply(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.updateLead(id, dto);
  }
}
