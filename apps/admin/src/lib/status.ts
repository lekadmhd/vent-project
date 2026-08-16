export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_FINANCE_APPROVAL = 'pending_finance_approval',
  PAID_IN_ESCROW = 'paid_in_escrow',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum KycStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PaymentVerificationStatus {
  WAITING_SUBMISSION = 'waiting_submission',
  PENDING_REVIEW = 'pending_review',
  VERIFIED_APPROVED = 'verified_approved',
  REJECTED_INVALID = 'rejected_invalid',
}

export enum PropertyStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}
