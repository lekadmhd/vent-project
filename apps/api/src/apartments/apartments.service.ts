import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOptionsWhere, Repository } from 'typeorm';
import { Request } from 'express';
import { Apartment } from './entities/apartment.entity';
import { CreateApartmentDto, SearchApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  BookingStatus,
  FurnishingStatus,
  PropertyStatus,
  UserRole,
} from '../common/types/enums';
import { AuthUser } from '../common/decorators/current-user.decorator';

const EARTH_RADIUS_KM = 6371;
const OCCUPYING_BOOKING_STATUSES = [
  BookingStatus.PENDING_FINANCE_APPROVAL,
  BookingStatus.PAID_IN_ESCROW,
  BookingStatus.CHECKED_IN,
];

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectRepository(Apartment)
    private readonly apartmentRepo: Repository<Apartment>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    landlord: AuthUser,
    dto: CreateApartmentDto,
    req: Request,
  ): Promise<Apartment> {
    const isAdmin =
      landlord.role === UserRole.SUPPORT_ADMIN ||
      landlord.role === UserRole.SUPER_ADMIN;
    const apartment = this.apartmentRepo.create({
      landlord_id: landlord.sub,
      title: dto.title,
      slug: this.makeSlug(dto.title),
      complex_name: dto.complex_name,
      unit_number: dto.unit_number,
      tower: dto.tower ?? null,
      bedroom_count: dto.bedroom_count ?? 1,
      bathroom_count: dto.bathroom_count ?? 1,
      size_sqm: dto.size_sqm != null ? String(dto.size_sqm) : null,
      address: dto.address,
      city: dto.city,
      latitude: String(dto.latitude),
      longitude: String(dto.longitude),
      price_monthly: String(dto.price_monthly),
      deposit_amount: String(dto.deposit_amount),
      status: isAdmin
        ? (dto.status ?? PropertyStatus.ACTIVE)
        : PropertyStatus.PENDING_APPROVAL,
      furnishing: dto.furnishing ?? FurnishingStatus.UNFURNISHED,
      image_urls: dto.image_urls ?? [],
      image_url: (dto.image_urls && dto.image_urls[0]) ?? null,
    });
    const saved = await this.apartmentRepo.save(apartment);
    await this.auditService.log(
      landlord.sub,
      'CREATE_PROPERTY',
      'apartments:' + saved.id,
      req,
    );
    return saved;
  }

  async update(
    actor: AuthUser,
    id: string,
    dto: UpdateApartmentDto,
    req: Request,
  ): Promise<Apartment> {
    const apartment = await this.findOrFail(id);

    if (dto.title != null) apartment.title = dto.title;
    if (dto.complex_name != null) apartment.complex_name = dto.complex_name;
    if (dto.unit_number != null) apartment.unit_number = dto.unit_number;
    if (dto.tower !== undefined) apartment.tower = dto.tower;
    if (dto.bedroom_count != null) apartment.bedroom_count = dto.bedroom_count;
    if (dto.bathroom_count != null) apartment.bathroom_count = dto.bathroom_count;
    if (dto.size_sqm != null) apartment.size_sqm = String(dto.size_sqm);
    if (dto.address != null) apartment.address = dto.address;
    if (dto.city != null) apartment.city = dto.city;
    if (dto.latitude != null) apartment.latitude = String(dto.latitude);
    if (dto.longitude != null) apartment.longitude = String(dto.longitude);
    if (dto.price_monthly != null) apartment.price_monthly = String(dto.price_monthly);
    if (dto.deposit_amount != null) apartment.deposit_amount = String(dto.deposit_amount);
    if (dto.status != null) apartment.status = dto.status;
    if (dto.furnishing != null) apartment.furnishing = dto.furnishing;
    if (dto.image_urls !== undefined) {
      apartment.image_urls = dto.image_urls;
      apartment.image_url = dto.image_urls[0] ?? null;
    }

    const saved = await this.apartmentRepo.save(apartment);
    await this.auditService.log(
      actor.sub,
      'UPDATE_PROPERTY',
      'apartments:' + id,
      req,
    );
    return saved;
  }

  async remove(actor: AuthUser, id: string, req: Request): Promise<void> {
    const apartment = await this.findOrFail(id);
    await this.apartmentRepo.remove(apartment);
    await this.auditService.log(
      actor.sub,
      'DELETE_PROPERTY',
      'apartments:' + id,
      req,
    );
  }

  async search(filters: SearchApartmentDto): Promise<Apartment[]> {
    const where: FindOptionsWhere<Apartment> = {
      status: PropertyStatus.ACTIVE,
    };

    if (filters.city) where.city = filters.city;
    if (filters.bedrooms) where.bedroom_count = filters.bedrooms;

    let qb = this.apartmentRepo
      .createQueryBuilder('a')
      .where('a.status = :status', { status: PropertyStatus.ACTIVE })
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.apartment_id = a.id
            AND b.status IN (:...occupiedStatuses)
            AND b.check_in <= CURRENT_DATE
            AND b.check_out >= CURRENT_DATE
        )`,
        { occupiedStatuses: OCCUPYING_BOOKING_STATUSES },
      );

    if (filters.city) {
      qb.andWhere('a.city = :city', { city: filters.city });
    }
    if (filters.bedrooms) {
      qb.andWhere('a.bedroom_count = :bedrooms', { bedrooms: filters.bedrooms });
    }
    if (filters.furnishing) {
      qb.andWhere('a.furnishing = :furnishing', { furnishing: filters.furnishing });
    }
    if (filters.min_price != null) {
      qb.andWhere('CAST(a.price_monthly AS numeric) >= :min', { min: filters.min_price });
    }
    if (filters.max_price != null) {
      qb.andWhere('CAST(a.price_monthly AS numeric) <= :max', { max: filters.max_price });
    }

    const lat = filters.lat;
    const lng = filters.lng;
    if (lat != null && lng != null) {
      const radius = filters.radius_km ?? 10;
      const latDelta = radius / EARTH_RADIUS_KM;
      const lngDelta = radius / (EARTH_RADIUS_KM * Math.cos((lat * Math.PI) / 180));
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('CAST(a.latitude AS float) BETWEEN :latMin AND :latMax', {
              latMin: lat - latDelta,
              latMax: lat + latDelta,
            })
            .andWhere('CAST(a.longitude AS float) BETWEEN :lngMin AND :lngMax', {
              lngMin: lng - lngDelta,
              lngMax: lng + lngDelta,
            });
        }),
      );
    }

    return qb.orderBy('a.created_at', 'DESC').getMany();
  }

  async listByLandlord(landlord: AuthUser): Promise<Apartment[]> {
    return this.apartmentRepo.find({
      where: { landlord_id: landlord.sub },
      order: { created_at: 'DESC' },
    });
  }

  async listAll(): Promise<Apartment[]> {
    return this.apartmentRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async moderate(
    actor: AuthUser,
    id: string,
    status: PropertyStatus,
    req: Request,
  ): Promise<Apartment> {
    if (actor.role !== UserRole.SUPPORT_ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only support/super admin may moderate apartments');
    }
    const apartment = await this.findOrFail(id);
    apartment.status = status;
    const saved = await this.apartmentRepo.save(apartment);
    await this.auditService.log(
      actor.sub,
      `MODERATE_PROPERTY_${status.toUpperCase()}`,
      'apartments:' + id,
      req,
    );
    return saved;
  }

  async findActiveForBooking(id: string): Promise<Apartment> {
    const apartment = await this.apartmentRepo.findOne({
      where: { id, status: PropertyStatus.ACTIVE },
    });
    if (!apartment) {
      throw new NotFoundException('Active apartment not found');
    }
    return apartment;
  }

  async findActiveById(id: string): Promise<Apartment> {
    const apartment = await this.apartmentRepo.findOne({
      where: { id, status: PropertyStatus.ACTIVE },
    });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }
    const occupied = await this.isOccupiedNow(id);
    (apartment as Apartment & { occupied: boolean }).occupied = occupied;
    return apartment;
  }

  private async isOccupiedNow(apartmentId: string): Promise<boolean> {
    const rows: { cnt: string }[] = await this.apartmentRepo.manager.query(
      `SELECT COUNT(*)::int AS cnt FROM bookings b
       WHERE b.apartment_id = $1
         AND b.status IN ($2, $3, $4)
         AND b.check_in <= CURRENT_DATE
         AND b.check_out >= CURRENT_DATE`,
      [apartmentId, ...OCCUPYING_BOOKING_STATUSES],
    );
    return Number(rows[0]?.cnt ?? 0) > 0;
  }

  private async findOrFail(id: string): Promise<Apartment> {
    const apartment = await this.apartmentRepo.findOne({ where: { id } });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }
    return apartment;
  }

  private makeSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${base}-${Date.now().toString(36)}`;
  }
}
