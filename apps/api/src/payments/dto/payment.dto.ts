import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SubmitPaymentDto {
  @IsString()
  bank_destination: string;

  @IsString()
  sender_bank_name: string;

  @IsString()
  sender_account_name: string;

  @IsNumber()
  @Min(0)
  transfer_amount: number;

  @IsString()
  proof_of_transfer_url: string;
}

export class ApprovePaymentDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectPaymentDto {
  @IsString()
  reason: string;
}
