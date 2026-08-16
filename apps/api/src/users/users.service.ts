import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { ModerateKycDto, UpdateKycDto } from './dto/user.dto';
import { CryptoService } from '../common/crypto/crypto.service';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  KycStatus,
  UserRole,
} from '../common/types/enums';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly auditService: AuditService,
  ) {}

  async getProfile(user: AuthUser): Promise<Partial<User>> {
    const found = await this.findOrFail(user.sub);
    return this.sanitize(found);
  }

  async updateKyc(user: AuthUser, dto: UpdateKycDto, req: Request): Promise<Partial<User>> {
    const found = await this.findOrFail(user.sub);

    found.id_card_number_encrypted = this.cryptoService.encrypt(dto.id_card_number);
    if (dto.id_card_url) found.id_card_url = dto.id_card_url;
    if (dto.selfie_url) found.selfie_url = dto.selfie_url;
    found.kyc_status = KycStatus.PENDING;

    const saved = await this.userRepo.save(found);
    await this.auditService.log(user.sub, AuditAction.KYC_UPDATE, 'users:' + user.sub, req);
    return this.sanitize(saved);
  }

  async listUsers(actor: AuthUser): Promise<Partial<User>[]> {
    const users = await this.userRepo.find({ order: { created_at: 'DESC' } });
    return users.map((u) =>
      this.sanitize(u, actor.role === UserRole.SUPPORT_ADMIN || actor.role === UserRole.SUPER_ADMIN),
    );
  }

  async viewKyc(
    actor: AuthUser,
    userId: string,
    req: Request,
  ): Promise<{ id_card_number: string | null } & Partial<User>> {
    if (actor.role !== UserRole.SUPPORT_ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only support/super admin may view KYC');
    }
    const user = await this.findOrFail(userId);
    await this.auditService.log(
      actor.sub,
      AuditAction.VIEW_DECRYPTED_KYC,
      'users:' + userId,
      req,
    );
    return {
      ...this.sanitize(user, true),
      id_card_number: user.id_card_number_encrypted
        ? this.cryptoService.decrypt(user.id_card_number_encrypted)
        : null,
    };
  }

  async moderateKyc(actor: AuthUser, userId: string, dto: ModerateKycDto, req: Request) {
    if (actor.role !== UserRole.SUPPORT_ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only support/super admin may moderate KYC');
    }
    const user = await this.findOrFail(userId);
    user.kyc_status = dto.status === 'approved' ? KycStatus.APPROVED : KycStatus.REJECTED;
    const saved = await this.userRepo.save(user);
    await this.auditService.log(
      actor.sub,
      `MODERATE_KYC_${dto.status.toUpperCase()}`,
      'users:' + userId,
      req,
    );
    return this.sanitize(saved, true);
  }

  private async findOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private sanitize(user: User, includeEncryptedFields = false): Partial<User> {
    const { password_hash, id_card_number_encrypted, id_card_url, selfie_url, ...rest } = user;
    const out: Partial<User> = { ...rest };
    if (includeEncryptedFields) {
      out.id_card_number_encrypted = id_card_number_encrypted;
      out.id_card_url = id_card_url;
      out.selfie_url = selfie_url;
    }
    return out;
  }
}
