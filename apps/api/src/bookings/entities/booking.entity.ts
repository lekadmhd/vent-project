import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingStatus } from '../../common/types/enums';
import { Apartment } from '../../apartments/entities/apartment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_code', unique: true })
  booking_code: string;

  @Column({ name: 'apartment_id' })
  apartment_id: string;

  @ManyToOne(() => Apartment)
  @JoinColumn({ name: 'apartment_id' })
  apartment: Apartment;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenant_id' })
  tenant: User;

  @Column({ name: 'check_in', type: 'date' })
  check_in: string;

  @Column({ name: 'check_out', type: 'date' })
  check_out: string;

  @Column({ name: 'rent_amount', type: 'decimal', precision: 12, scale: 2 })
  rent_amount: string;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 12, scale: 2 })
  deposit_amount: string;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 12, scale: 2 })
  platform_fee: string;

  @Column({ name: 'unique_code', type: 'int' })
  unique_code: number;

  @Column({ name: 'total_paid', type: 'decimal', precision: 12, scale: 2 })
  total_paid: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING_PAYMENT })
  status: BookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
