import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApartmentsService } from './apartments.service';
import { ApartmentsController } from './apartments.controller';
import { Apartment } from './entities/apartment.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Apartment]), AuditModule],
  providers: [ApartmentsService],
  controllers: [ApartmentsController],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
