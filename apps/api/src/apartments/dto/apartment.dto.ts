import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PropertyStatus } from '../../common/types/enums';

export class CreateApartmentDto {
  @IsString()
  title: string;

  @IsString()
  complex_name: string;

  @IsString()
  unit_number: string;

  @IsString()
  @IsOptional()
  tower?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  bedroom_count?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  bathroom_count?: number;

  @IsNumber()
  @IsOptional()
  size_sqm?: number;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsNumber()
  @Min(0)
  price_monthly: number;

  @IsNumber()
  @Min(0)
  deposit_amount: number;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;
}

export class UpdateApartmentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  complex_name?: string;

  @IsString()
  @IsOptional()
  unit_number?: string;

  @IsString()
  @IsOptional()
  tower?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  bedroom_count?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  bathroom_count?: number;

  @IsNumber()
  @IsOptional()
  size_sqm?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price_monthly?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deposit_amount?: number;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;
}

export class SearchApartmentDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  min_price?: number;

  @IsNumber()
  @IsOptional()
  max_price?: number;

  @IsInt()
  @IsOptional()
  bedrooms?: number;

  @IsLatitude()
  @IsOptional()
  lat?: number;

  @IsLongitude()
  @IsOptional()
  lng?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  radius_km?: number;
}
