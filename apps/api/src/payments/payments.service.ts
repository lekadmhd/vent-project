import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { ManualPayment } from './entities/manual-payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ApprovePaymentDto, RejectPaymentDto, SubmitPaymentDto } from './dto/payment.dto';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  BookingStatus,
  PaymentVerificationStatus,
  UserRole,
} from '../common/types/enums';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(ManualPayment)
    private readonly paymentRepo: Repository<ManualPayment>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly auditService: AuditService,
  ) {}

  async submit(
    tenant: AuthUser,
    bookingId: string,
    dto: SubmitPaymentDto,
    req: Request,
  ): Promise<ManualPayment> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, tenant_id: tenant.sub },
      relations: { apartment: true },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException(`Cannot submit payment when status is ${booking.status}`);
    }

    const payment = this.paymentRepo.create({
      booking_id: bookingId,
      tenant_id: tenant.sub,
      bank_destination: dto.bank_destination,
      sender_bank_name: dto.sender_bank_name,
      sender_account_name: dto.sender_account_name,
      transfer_amount: String(dto.transfer_amount),
      proof_of_transfer_url: dto.proof_of_transfer_url,
      id_card_url: dto.id_card_url ?? null,
      verification_status: PaymentVerificationStatus.PENDING_REVIEW,
    });
    const saved = await this.paymentRepo.save(payment);

    booking.status = BookingStatus.PENDING_FINANCE_APPROVAL;
    await this.bookingRepo.save(booking);

    await this.auditService.log(
      tenant.sub,
      AuditAction.SUBMIT_MANUAL_PAYMENT,
      'bookings:' + bookingId,
      req,
    );
    return saved;
  }

  async listByTenant(tenant: AuthUser): Promise<ManualPayment[]> {
    return this.paymentRepo.find({
      where: { tenant_id: tenant.sub },
      relations: { booking: true },
      order: { created_at: 'DESC' },
    });
  }

  async listForFinance(status?: PaymentVerificationStatus): Promise<ManualPayment[]> {
    const where = status ? { verification_status: status } : {};
    return this.paymentRepo.find({
      where,
      relations: { booking: { apartment: true }, tenant: true },
      order: { created_at: 'ASC' },
    });
  }

  async approve(
    finance: AuthUser,
    paymentId: string,
    req: Request,
    _dto?: ApprovePaymentDto,
  ): Promise<ManualPayment> {
    this.assertFinance(finance);
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: { booking: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.verification_status !== PaymentVerificationStatus.PENDING_REVIEW) {
      throw new BadRequestException('Payment is not awaiting review');
    }

    const invoiceTotal = this.toNum(payment.booking.total_paid);
    const transferred = this.toNum(payment.transfer_amount);
    if (transferred !== invoiceTotal) {
      throw new BadRequestException(
        `Amount mismatch: invoice expects ${invoiceTotal}, received ${transferred}. Reject instead.`,
      );
    }

    payment.verification_status = PaymentVerificationStatus.VERIFIED_APPROVED;
    payment.verified_by = finance.sub;
    payment.verified_at = new Date();
    const saved = await this.paymentRepo.save(payment);

    payment.booking.status = BookingStatus.PAID_IN_ESCROW;
    await this.bookingRepo.save(payment.booking);

    await this.auditService.log(
      finance.sub,
      AuditAction.APPROVE_MANUAL_PAYMENT,
      'payments:' + paymentId,
      req,
    );
    return saved;
  }

  async reject(
    finance: AuthUser,
    paymentId: string,
    dto: RejectPaymentDto,
    req: Request,
  ): Promise<ManualPayment> {
    this.assertFinance(finance);
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: { booking: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.verification_status !== PaymentVerificationStatus.PENDING_REVIEW) {
      throw new BadRequestException('Payment is not awaiting review');
    }

    payment.verification_status = PaymentVerificationStatus.REJECTED_INVALID;
    payment.verified_by = finance.sub;
    payment.rejection_reason = dto.reason;
    payment.verified_at = new Date();
    const saved = await this.paymentRepo.save(payment);

    // Tenant gets 24h to re-upload -> back to pending_payment
    payment.booking.status = BookingStatus.PENDING_PAYMENT;
    await this.bookingRepo.save(payment.booking);

    await this.auditService.log(
      finance.sub,
      AuditAction.REJECT_MANUAL_PAYMENT,
      'payments:' + paymentId,
      req,
    );
    return saved;
  }

  private assertFinance(user: AuthUser): void {
    const allowed = [UserRole.FINANCE_ADMIN, UserRole.SUPER_ADMIN];
    if (!allowed.includes(user.role as UserRole)) {
      throw new ForbiddenException('Only finance admin may verify payments');
    }
  }

  private toNum(value: string): number {
    return parseFloat(value);
  }
}
