import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyStatus } from '../../common/types/enums';
import { User } from '../../users/entities/user.entity';

@Entity('apartments')
export class Apartment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'landlord_id' })
  landlord_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landlord_id' })
  landlord: User;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'complex_name' })
  complex_name: string;

  @Column({ name: 'unit_number' })
  unit_number: string;

  @Column({ type: 'varchar', nullable: true })
  tower: string | null;

  @Column({ name: 'bedroom_count', type: 'int', default: 1 })
  bedroom_count: number;

  @Column({ name: 'bathroom_count', type: 'int', default: 1 })
  bathroom_count: number;

  @Column({ name: 'size_sqm', type: 'decimal', precision: 6, scale: 2, nullable: true })
  size_sqm: string | null;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: string;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price_monthly: string;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 12, scale: 2 })
  deposit_amount: string;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.PENDING_APPROVAL })
  status: PropertyStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
