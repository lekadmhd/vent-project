import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/booking.dto';
import { ApartmentsService } from '../apartments/apartments.service';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  BookingStatus,
  UserRole,
} from '../common/types/enums';
import { AuthUser } from '../common/decorators/current-user.decorator';

const PLATFORM_FEE_RATE = 0.025;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly apartmentsService: ApartmentsService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenant: AuthUser,
    apartmentId: string,
    dto: CreateBookingDto,
    req: Request,
  ): Promise<Booking> {
    const apartment = await this.apartmentsService.findActiveForBooking(apartmentId);
    const nights = this.nightsBetween(dto.check_in, dto.check_out);
    if (nights < 1) {
      throw new BadRequestException('check_out must be after check_in');
    }

    const overlap = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.apartment_id = :apartmentId', { apartmentId })
      .andWhere('b.status IN (:...statuses)', {
        statuses: [
          BookingStatus.PENDING_PAYMENT,
          BookingStatus.PENDING_FINANCE_APPROVAL,
          BookingStatus.PAID_IN_ESCROW,
          BookingStatus.CHECKED_IN,
        ],
      })
      .andWhere('b.check_in < :checkOut', { checkOut: dto.check_out })
      .andWhere('b.check_out > :checkIn', { checkIn: dto.check_in })
      .getCount();

    if (overlap > 0) {
      throw new ConflictException(
        'Unit sudah terbooking pada periode tersebut. Silakan pilih tanggal lain.',
      );
    }

    const nightlyRate = this.toNum(apartment.price_monthly) / 30;
    const rentAmount = Math.round(nightlyRate * nights * 100) / 100;
    const deposit = this.toNum(apartment.deposit_amount);
    const platformFee = Math.round(rentAmount * PLATFORM_FEE_RATE * 100) / 100;
    const uniqueCode = Math.floor(100 + Math.random() * 900);

    const booking = this.bookingRepo.create({
      booking_code: this.makeBookingCode(),
      apartment_id: apartmentId,
      tenant_id: tenant.sub,
      check_in: dto.check_in,
      check_out: dto.check_out,
      rent_amount: String(rentAmount),
      deposit_amount: String(deposit),
      platform_fee: String(platformFee),
      unique_code: uniqueCode,
      total_paid: String(Math.round((rentAmount + deposit + platformFee + uniqueCode) * 100) / 100),
      status: BookingStatus.PENDING_PAYMENT,
    });
    const saved = await this.bookingRepo.save(booking);
    await this.auditService.log(
      tenant.sub,
      AuditAction.UPDATE_BOOKING_STATUS,
      'bookings:' + saved.id,
      req,
    );
    return saved;
  }

  async listForTenant(tenant: AuthUser): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { tenant_id: tenant.sub },
      relations: { apartment: true },
      order: { created_at: 'DESC' },
    });
  }

  async listForLandlord(landlord: AuthUser): Promise<Booking[]> {
    return this.bookingRepo
      .createQueryBuilder('b')
      .innerJoin('b.apartment', 'a')
      .where('a.landlord_id = :landlordId', { landlordId: landlord.sub })
      .orderBy('b.created_at', 'DESC')
      .getMany();
  }

  async findByTenant(tenant: AuthUser, id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id, tenant_id: tenant.sub },
      relations: { apartment: true },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async setStatus(
    actor: AuthUser,
    id: string,
    status: BookingStatus,
    req: Request,
  ): Promise<Booking> {
    const booking = await this.findOrFail(id);

    if (status === BookingStatus.CHECKED_IN || status === BookingStatus.COMPLETED) {
      const allowedRoles = [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN];
      if (!allowedRoles.includes(actor.role as UserRole)) {
        throw new ForbiddenException('Only support/super admin may update check-in/completed');
      }
      const validFrom = {
        [BookingStatus.CHECKED_IN]: [BookingStatus.PAID_IN_ESCROW],
        [BookingStatus.COMPLETED]: [BookingStatus.CHECKED_IN],
      };
      if (!validFrom[status].includes(booking.status)) {
        throw new BadRequestException(`Cannot transition ${booking.status} -> ${status}`);
      }
    } else if (status === BookingStatus.CANCELLED) {
      const isOwner = booking.tenant_id === actor.sub;
      const isAdmin = actor.role === UserRole.SUPPORT_ADMIN || actor.role === UserRole.SUPER_ADMIN;
      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('Only booking owner or admin may cancel');
      }
      if (![BookingStatus.PENDING_PAYMENT, BookingStatus.PENDING_FINANCE_APPROVAL].includes(booking.status)) {
        throw new BadRequestException('Booking can no longer be cancelled');
      }
    } else {
      throw new BadRequestException('Unsupported status transition via this endpoint');
    }

    booking.status = status;
    const saved = await this.bookingRepo.save(booking);
    await this.auditService.log(
      actor.sub,
      AuditAction.UPDATE_BOOKING_STATUS,
      'bookings:' + id,
      req,
    );
    return saved;
  }

  private async findOrFail(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  private nightsBetween(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.round((end.getTime() - start.getTime()) / 86_400_000);
  }

  private makeBookingCode(): string {
    return 'BR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  }

  private toNum(value: string): number {
    return parseFloat(value);
  }
}
