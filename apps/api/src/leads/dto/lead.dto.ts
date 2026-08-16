import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { LeadStatus } from '../../common/types/enums';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(5)
  address: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  phone: string;
}

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body: string;
}

export class UpdateLeadDto {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
