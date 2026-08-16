-- ================================================================================
-- AptRent v4.0 - PostgreSQL + PostGIS Schema
-- Reference: PRD 4.0 Section 6
-- Note: Requires extension postgis (CREATE EXTENSION IF NOT EXISTS postgis;)
-- ================================================================================

-- ================================================================
-- 1. ENUMS
-- ================================================================
CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'support_admin', 'finance_admin', 'super_admin');
CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'approved', 'rejected');
CREATE TYPE property_status AS ENUM ('draft', 'pending_approval', 'active', 'rejected', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'pending_finance_approval', 'paid_in_escrow', 'checked_in', 'completed', 'cancelled', 'disputed');
CREATE TYPE payment_verification_status AS ENUM ('waiting_submission', 'pending_review', 'verified_approved', 'rejected_invalid');

-- ================================================================
-- 2. USERS TABLE WITH ENCRYPTED PII
-- ================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role DEFAULT 'tenant',
    kyc_status kyc_status DEFAULT 'unverified',
    id_card_number_encrypted TEXT, -- Encrypted via AES-256-GCM
    id_card_url TEXT,              -- S3 Private Key Path
    selfie_url TEXT,               -- S3 Private Key Path
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 3. APARTMENTS TABLE
-- ================================================================
CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    complex_name VARCHAR(255) NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    tower VARCHAR(50),
    bedroom_count INT DEFAULT 1,
    bathroom_count INT DEFAULT 1,
    size_sqm DECIMAL(6,2),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(Point, 4326),
    price_monthly DECIMAL(12, 2) NOT NULL,
    deposit_amount DECIMAL(12, 2) NOT NULL,
    status property_status DEFAULT 'pending_approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartments_location ON apartments USING GIST (location);
CREATE INDEX idx_apartments_landlord ON apartments(landlord_id);
CREATE INDEX idx_apartments_status ON apartments(status);
CREATE INDEX idx_apartments_city ON apartments(city);

-- ================================================================
-- 4. BOOKINGS TABLE
-- ================================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    apartment_id UUID NOT NULL REFERENCES apartments(id),
    tenant_id UUID NOT NULL REFERENCES users(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    rent_amount DECIMAL(12, 2) NOT NULL,
    deposit_amount DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) NOT NULL,
    unique_code INT NOT NULL, -- Kode Unik Transfer (cth: 432)
    total_paid DECIMAL(12, 2) NOT NULL,
    status booking_status DEFAULT 'pending_payment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_apartment ON bookings(apartment_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at);

-- ================================================================
-- 5. MANUAL PAYMENT CONFIRMATIONS TABLE
-- ================================================================
CREATE TABLE manual_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    tenant_id UUID NOT NULL REFERENCES users(id),
    bank_destination VARCHAR(100) NOT NULL,
    sender_bank_name VARCHAR(100) NOT NULL,
    sender_account_name VARCHAR(255) NOT NULL,
    transfer_amount DECIMAL(12, 2) NOT NULL,
    proof_of_transfer_url TEXT NOT NULL, -- S3 Private URL
    verification_status payment_verification_status DEFAULT 'pending_review',
    verified_by UUID REFERENCES users(id), -- Finance Admin ID
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_manual_payments_booking ON manual_payments(booking_id);
CREATE INDEX idx_manual_payments_status ON manual_payments(verification_status);
CREATE INDEX idx_manual_payments_tenant ON manual_payments(tenant_id);

-- ================================================================
-- 6. SECURITY AUDIT LOGS TABLE
-- ================================================================
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL, -- e.g., "VIEW_DECRYPTED_KYC", "APPROVE_MANUAL_PAYMENT"
    target_resource VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_audit_logs_actor ON security_audit_logs(actor_id);
CREATE INDEX idx_security_audit_logs_created ON security_audit_logs(created_at);

-- ================================================================
-- TRIGGER: auto-update updated_at on users
-- ================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
