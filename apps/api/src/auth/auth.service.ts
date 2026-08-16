import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, UserRole } from '../common/types/enums';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto, req: Request) {
    const emailExists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (emailExists) {
      throw new ConflictException('Email already registered');
    }
    const phoneExists = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (phoneExists) {
      throw new ConflictException('Phone already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      password_hash,
      role: dto.role ?? UserRole.TENANT,
    });
    const saved = await this.userRepo.save(user);

    await this.auditService.log(saved.id, AuditAction.LOGIN, 'users:' + saved.id, req);
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto, req: Request) {
    const user = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      await this.auditService.log(
        null,
        AuditAction.LOGIN_FAILED,
        'users:' + (user?.id ?? 'unknown'),
        req,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.auditService.log(user.id, AuditAction.LOGIN, 'users:' + user.id, req);
    return this.buildAuthResponse(user);
  }

  async changePassword(user: AuthUser, dto: ChangePasswordDto, req: Request) {
    const found = await this.userRepo.findOne({ where: { id: user.sub } });
    if (!found || !(await bcrypt.compare(dto.old_password, found.password_hash))) {
      throw new BadRequestException('Password lama salah');
    }
    if (dto.old_password === dto.new_password) {
      throw new BadRequestException('Password baru harus berbeda dari password lama');
    }
    found.password_hash = await bcrypt.hash(dto.new_password, 10);
    await this.userRepo.save(found);
    await this.auditService.log(
      user.sub,
      'CHANGE_PASSWORD',
      'users:' + user.sub,
      req,
    );
    return { success: true };
  }

  private buildAuthResponse(user: User) {
    const payload: AuthUser = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kyc_status: user.kyc_status,
      },
    };
  }
}
