import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateKycDto {
  @IsString()
  @Length(16, 16, { message: 'NIK must be 16 digits' })
  id_card_number: string;

  @IsString()
  @IsOptional()
  id_card_url?: string;

  @IsString()
  @IsOptional()
  selfie_url?: string;
}

export class ModerateKycDto {
  @IsString()
  status: 'approved' | 'rejected';
}
