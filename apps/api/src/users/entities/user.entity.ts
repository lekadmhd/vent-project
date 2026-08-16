import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KycStatus, UserRole } from '../../common/types/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TENANT })
  role: UserRole;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.UNVERIFIED })
  kyc_status: KycStatus;

  @Column({ name: 'id_card_number_encrypted', type: 'text', nullable: true })
  id_card_number_encrypted: string | null;

  @Column({ name: 'id_card_url', type: 'text', nullable: true })
  id_card_url: string | null;

  @Column({ name: 'selfie_url', type: 'text', nullable: true })
  selfie_url: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
