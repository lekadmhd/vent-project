import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('security_audit_logs')
export class SecurityAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_id', nullable: true, type: 'uuid' })
  actor_id: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ name: 'target_resource', type: 'varchar', length: 255 })
  target_resource: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ip_address: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  user_agent: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
