export enum UserRole {
  TENANT = 'tenant',
  LANDLORD = 'landlord',
  SUPPORT_ADMIN = 'support_admin',
  FINANCE_ADMIN = 'finance_admin',
  SUPER_ADMIN = 'super_admin',
}

export enum KycStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PropertyStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_FINANCE_APPROVAL = 'pending_finance_approval',
  PAID_IN_ESCROW = 'paid_in_escrow',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum PaymentVerificationStatus {
  WAITING_SUBMISSION = 'waiting_submission',
  PENDING_REVIEW = 'pending_review',
  VERIFIED_APPROVED = 'verified_approved',
  REJECTED_INVALID = 'rejected_invalid',
}

export enum FurnishingStatus {
  UNFURNISHED = 'unfurnished',
  SEMI_FURNISHED = 'semi_furnished',
  FURNISHED = 'furnished',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CLOSED = 'closed',
}

export enum AuditAction {
  VIEW_DECRYPTED_KYC = 'VIEW_DECRYPTED_KYC',
  APPROVE_MANUAL_PAYMENT = 'APPROVE_MANUAL_PAYMENT',
  REJECT_MANUAL_PAYMENT = 'REJECT_MANUAL_PAYMENT',
  SUBMIT_MANUAL_PAYMENT = 'SUBMIT_MANUAL_PAYMENT',
  UPDATE_BOOKING_STATUS = 'UPDATE_BOOKING_STATUS',
  VIEW_TRANSACTION = 'VIEW_TRANSACTION',
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  KYC_UPDATE = 'KYC_UPDATE',
}
