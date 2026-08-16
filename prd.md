PRODUCT REQUIREMENT DOCUMENT (PRD)
Platform Sewa Unit Apartemen Enterprise (AptRent System)
Dokumen Version: 4.0 (Futuristic UI/UX, Advanced Security/Privacy & Manual Finance Escalation)
Tanggal Release: 16 Agustus 2026
Status Dokumen: Approved for Engineering & Development
Format: Plain Text (.txt)

================================================================================
1. EXECUTIVE SUMMARY & OVERVIEW PRODUK
================================================================================

1.1 Visi Produk
AptRent v4.0 adalah platform marketplace sewa apartemen tingkat lanjut (Enterprise-Grade) dengan antarmuka futuristik, arsitektur data sangat aman (Zero-Trust Data Protection), dan alur pembayaran manual berbasis verifikasi ketat oleh Finance Admin.

1.2 Karakteristik Utama Produk v4.0
- Interface Futuristik: Glassmorphism UI, Dark Mode Default, 3D Interactive Building Tour, Real-time Dashboard Analytics with Neon Accent Controls.
- Keamanan Data Tingkat Tinggi (Data Privacy & Security): Field-Level Encryption (AES-256) untuk PII (KTP/Paspor), S3 Private Storage dengan Signed URL (TTL 15 Menit), Watermarking Otomatis pada Foto KTP/Sertifikat.
- Metode Pembayaran: Manual Transfer Bank (Virtual Account / Rekening Bank Platform) dengan Verifikasi Manual 2-Layer oleh Admin Finance sebelum Escrow diaktifkan.


================================================================================
2. MATRIKS KEAMANAN DATA & HAK AKSES (SECURITY & PRIVACY ARCHITECTURE)
================================================================================

2.1 Perlindungan Data Pribadi (PII & Legal Document Protection)
- Field-Level Encryption: NIK, Foto KTP, Selfie, dan No. Rekening dienkripsi menggunakan AES-256-GCM pada level aplikasi sebelum disimpan ke PostgreSQL.
- Dynamic Image Watermarking: Setiap render image KTP/Sertifikat pada panel Admin akan di-overlay watermark otomatis: "CONFIDENTIAL - APTRENT ADMIN USE ONLY - [ADMIN_ID] - [TIMESTAMP]".
- Short-Lived Pre-signed URLs: File KTP/SHM di AWS S3 tidak pernah dipublikasikan. Akses hanya via Presigned URL yang kadaluwarsa dalam 15 menit.
- Anonymized Data Storage: Data audit trail dan statistik publik menggunakan Hashed User ID untuk mencegah pelacakan identitas.

2.2 Role Access Matrix & Permission Boundaries

Role                | Akses Data Sensitive (KYC/KTP) | Akses Transaksi/Finance | Tampilan Interface
---------------------------------------------------------------------------------------------------------
TENANT              | Hanya Data Sendiri             | Upload Bukti Bayar      | Cyberpunk/Glassmorphism App
LANDLORD            | Ter-anonymize (Tanpa NIK)      | Laporan Payout Saldo   | Neon Futuristic Dashboard
SUPPORT_ADMIN       | Lihat KTP (Watermarked)        | Read-only Status        | Admin Control Center
FINANCE_ADMIN       | No KTP Access                  | Approve/Reject Payment  | Finance Escalation Panel
SUPER_ADMIN         | Full Access + Decryption Key   | Full Audit Control      | Central System Node


================================================================================
3. ALUR PEMBAYARAN KONFIRMASI MANUAL (MANUAL FINANCE VERIFICATION FLOW)
================================================================================

3.1 Flow Transaksi Manual Transfer
1. Tenant melakukan booking unit apartemen (Status: PENDING_PAYMENT).
2. Sistem menerbitkan Invoice dengan Kode Unik Pembayaran (contoh: Rp 5.000.432,-).
3. Tenant melakukan transfer ke Rekening Bank Resmi Platform (Escrow Account) dan mengunggah Bukti Transfer (File: JPG/PNG/PDF, Max 5MB).
4. Status Booking berubah menjadi PENDING_FINANCE_APPROVAL.
5. Finance Admin menerima notifikasi real-time di Dashboard Finance.
6. Finance Admin memverifikasi:
   a. Kesesuaian jumlah transfer dengan Invoice (termasuk kode unik).
   b. Rekening pengirim vs mutasi bank real-time (API Bank / Checking Manual).
7. Jika Valid:
   - Finance Admin mengklik "APPROVE PAYMENT".
   - Status Booking berubah menjadi PAID_IN_ESCROW.
   - Sistem menerbitkan e-Receipt resmi dan mengirim notifikasi WhatsApp/Email ke Tenant & Landlord.
8. Jika Tidak Valid:
   - Finance Admin mengklik "REJECT PAYMENT" (dengan Alasan: Bukti Buram / Nominal Tidak Sesuai / Mutasi Tidak Ditemukan).
   - Tenant mendapatkan kesempatan upload ulang dalam batas waktu 24 jam.


================================================================================
4. SPESIFIKASI DESIGN SYSTEM & FUTURISTIC UI/UX
================================================================================

4.1 Design Tokens (Futuristic Glassmorphism)
- Color Palette:
  * Primary Accent : Electric Cyan (#00F0FF)
  * Secondary Accent: Neon Purple (#7000FF)
  * Background Dark: Deep Space Gray (#0A0E17 / #121824)
  * Surface Overlay: Translucent Glass (rgba(18, 24, 36, 0.65) dengan backdrop-filter: blur(16px))
  * Text Contrast  : Pure White (#FFFFFF) & Muted Ice (#A0AEC0)
- Typography: Inter / Space Grotesk / JetBrains Mono (untuk angka/invoice/kode).

4.2 Komponen Interaktif
- 3D Interactive Apartment Floorplan Viewer (WebGL / Three.js Canvas).
- Real-Time Live Occupancy Heatmap di Map View.
- Holographic-style Status Badges (Pulsing Glow Effects pada status booking/payment).


================================================================================
5. SPESIFIKASI FITUR TERPERINCI (MODULE SPECIFICATIONS)
================================================================================

5.1 Portal Tenant (Futuristic Web & Mobile)
- Geo-Spatial Spatial Search dengan Filter Radius & Interactive Map 3D.
- Rincian Biaya Transparan sebelum Booking (Harga Sewa + Deposit + Admin Fee).
- Portal Upload Bukti Transfer Manual dengan Preview OCR otomatis (Mendeteksi Nominal dari Struk Transfer).
- Digital Key Counter & Live Countdown Check-in Timer.

5.2 Portal Landlord (Owner Dashboard)
- Interactive Dynamic Pricing Calendar (Mengubah harga sewa per hari/akhir pekan).
- Live Revenue Telemetry (Grafik Keuangan dengan Recharts Glowing Line).
- Payout Withdrawal Queue (Mengajukan Pencairan ke Finance Admin).

5.3 Admin Panel (Finance Escalation & Operations Control)
- Finance Verification Matrix Grid:
  * Filter: Pending Verification, Approved, Rejected, Flagged Suspicious.
  * Side-by-Side View: Foto Bukti Transfer vs Detail Invoice Pembayaran.
  * 1-Click Verification Action (Approve / Reject with Reason Modal).
- Tenant & Landlord KYC Moderation Module (Foto KTP dengan Watermark Dinamis).
- Escrow Release Controller: Tombol Manual / Auto Release H+1 setelah Check-In.


================================================================================
6. DATABASE SCHEMA & DDL STATEMENT (POSTGRESQL + POSTGIS)
================================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'support_admin', 'finance_admin', 'super_admin');
CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'approved', 'rejected');
CREATE TYPE property_status AS ENUM ('draft', 'pending_approval', 'active', 'rejected', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'pending_finance_approval', 'paid_in_escrow', 'checked_in', 'completed', 'cancelled', 'disputed');
CREATE TYPE payment_verification_status AS ENUM ('waiting_submission', 'pending_review', 'verified_approved', 'rejected_invalid');

-- 2. USERS TABLE WITH ENCRYPTED PII
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

-- 3. APARTMENTS TABLE
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

-- 4. BOOKINGS TABLE
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

-- 5. MANUAL PAYMENT CONFIRMATIONS TABLE
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

-- 6. SECURITY AUDIT LOGS TABLE
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL, -- e.g., "VIEW_DECRYPTED_KYC", "APPROVE_MANUAL_PAYMENT"
    target_resource VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


================================================================================
7. ARCHITECTURE & DEPLOYMENT GUIDE (NATIVE VPS SETUP)
================================================================================

7.1 Process Architecture (PM2 Cluster)
- Port 5000: Node.js API (Express/NestJS + AES Decryption Engine)
- Port 3000: Next.js Tenant Portal (Futuristic Dark UI)
- Port 3001: Next.js Admin & Finance Panel

7.2 Nginx Proxy Server Block (`/etc/nginx/sites-available/aptrent`)
server {
    listen 80;
    server_name aptrent.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name admin.aptrent.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name api.aptrent.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}