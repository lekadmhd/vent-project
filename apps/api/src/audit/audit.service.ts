import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { SecurityAuditLog } from './entities/security-audit-log.entity';
import { AuditAction } from '../common/types/enums';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(SecurityAuditLog)
    private readonly auditRepo: Repository<SecurityAuditLog>,
  ) {}

  async log(
    actorId: string | null,
    action: AuditAction | string,
    targetResource: string,
    req?: Request,
  ): Promise<SecurityAuditLog> {
    const entry = this.auditRepo.create({
      actor_id: actorId,
      action,
      target_resource: targetResource,
      ip_address: req?.ip ?? 'unknown',
      user_agent: req?.headers['user-agent'] ?? null,
    });
    return this.auditRepo.save(entry);
  }

  findByActor(actorId: string): Promise<SecurityAuditLog[]> {
    return this.auditRepo.find({
      where: { actor_id: actorId },
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  findAll(): Promise<SecurityAuditLog[]> {
    return this.auditRepo.find({
      order: { created_at: 'DESC' },
      take: 200,
    });
  }
}
