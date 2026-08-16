import { IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsDateString()
  check_in: string;

  @IsDateString()
  check_out: string;
}
