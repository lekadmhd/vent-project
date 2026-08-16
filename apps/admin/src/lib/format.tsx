import { BookingStatus, KycStatus, PaymentVerificationStatus, PropertyStatus } from './status';

const labels: Record<string, string> = {
  pending_payment: 'Pending Payment',
  pending_finance_approval: 'Pending Finance',
  paid_in_escrow: 'Paid in Escrow',
  checked_in: 'Checked In',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  unverified: 'Unverified',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  active: 'Active',
  suspended: 'Suspended',
  waiting_submission: 'Waiting Submission',
  pending_review: 'Pending Review',
  verified_approved: 'Approved',
  rejected_invalid: 'Rejected',
};

const tone: Record<string, string> = {
  pending_payment: 'warn',
  pending_finance_approval: 'accent',
  paid_in_escrow: 'success',
  checked_in: 'accent',
  completed: 'success',
  cancelled: 'danger',
  disputed: 'danger',
  unverified: 'neutral',
  pending: 'warn',
  approved: 'success',
  rejected: 'danger',
  pending_approval: 'warn',
  active: 'success',
  suspended: 'danger',
  waiting_submission: 'neutral',
  pending_review: 'accent',
  verified_approved: 'success',
  rejected_invalid: 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = tone[status] ?? 'neutral';
  return (
    <span className={`badge ${cls}`}>
      {labels[status] ?? status.replace(/_/g, ' ')}
    </span>
  );
}

export function fmtIdr(n: number | string): string {
  const value = typeof n === 'string' ? parseFloat(n) : n;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtDateTime(s: string): string {
  return new Date(s).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export type { BookingStatus, KycStatus, PaymentVerificationStatus, PropertyStatus };
