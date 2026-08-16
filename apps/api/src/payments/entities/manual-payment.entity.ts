import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentVerificationStatus } from '../../common/types/enums';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';

@Entity('manual_payments')
export class ManualPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id' })
  booking_id: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenant_id' })
  tenant: User;

  @Column({ name: 'bank_destination' })
  bank_destination: string;

  @Column({ name: 'sender_bank_name' })
  sender_bank_name: string;

  @Column({ name: 'sender_account_name' })
  sender_account_name: string;

  @Column({ name: 'transfer_amount', type: 'decimal', precision: 12, scale: 2 })
  transfer_amount: string;

  @Column({ name: 'proof_of_transfer_url' })
  proof_of_transfer_url: string;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: PaymentVerificationStatus,
    default: PaymentVerificationStatus.PENDING_REVIEW,
  })
  verification_status: PaymentVerificationStatus;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verified_by: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verified_by' })
  verifier: User | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejection_reason: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verified_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
