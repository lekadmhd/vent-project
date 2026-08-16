-- AptRent dummy seed data: apartments
-- Idempotent: only seeds when the apartments table is empty.
-- Uses the first LANDLORD user as owner. Run as postgres superuser:
--   sudo -u postgres psql -d aptrent -f seed_apartments.sql

DO $$
DECLARE
  landlord_id UUID;
BEGIN
  SELECT id INTO landlord_id
  FROM users
  WHERE role = 'landlord'
  ORDER BY created_at
  LIMIT 1;

  IF landlord_id IS NULL THEN
    RAISE NOTICE 'No landlord user found - create one first (e.g. via register or INSERT).';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM apartments) THEN
    RAISE NOTICE 'Apartments already seeded (% rows), skipping.', (SELECT count(*) FROM apartments);
    RETURN;
  END IF;

  INSERT INTO apartments (
    landlord_id, title, slug, complex_name, unit_number, tower,
    bedroom_count, bathroom_count, size_sqm, address, city,
    latitude, longitude, location, price_monthly, deposit_amount, status
  ) VALUES
  -- Jakarta Selatan
  (landlord_id, 'Studio Eksekutif Kalibata City', 'kalibata-city-tower-a-1207', 'Kalibata City', '1207', 'Tower A',
   1, 1, 28.00, 'Jl. Kalibata Timur I No. 4, Pancoran', 'Jakarta Selatan',
   -6.26200000, 106.83200000, ST_SetSRID(ST_MakePoint(106.83200000, -6.26200000), 4326), 4200000.00, 2100000.00, 'active'),
  (landlord_id, '2BR Taman Rasuna Tower Emerald', 'taman-rasuna-tower-emerald-2208', 'Taman Rasuna Apartment', '2208', 'Tower Emerald',
   2, 2, 78.00, 'Jl. H.R. Rasuna Said, Setiabudi', 'Jakarta Selatan',
   -6.22730000, 106.82960000, ST_SetSRID(ST_MakePoint(106.82960000, -6.22730000), 4326), 9500000.00, 4750000.00, 'active'),
  (landlord_id, '1BR Gandaria Heights', 'gandaria-heights-tower-a-1105', 'Gandaria Heights', '1105', 'Tower A',
   1, 1, 46.00, 'Jl. Gandaria Tengah IV, Kebayoran Baru', 'Jakarta Selatan',
   -6.24850000, 106.78570000, ST_SetSRID(ST_MakePoint(106.78570000, -6.24850000), 4326), 7800000.00, 3900000.00, 'active'),
  (landlord_id, '3BR Kemang Village Green Tower', 'kemang-village-green-tower-3301', 'Kemang Village', '3301', 'Tower Green',
   3, 3, 128.00, 'Jl. Pangeran Antasari No. 36, Mampang', 'Jakarta Selatan',
   -6.26260000, 106.81180000, ST_SetSRID(ST_MakePoint(106.81180000, -6.26260000), 4326), 18500000.00, 9250000.00, 'active'),
  (landlord_id, '2BR The Peak Senayan', 'the-peak-senayan-tower-a-1812', 'The Peak Senayan', '1812', 'Tower A',
   2, 2, 98.00, 'Jl. Asia Afrika, Gelora Bung Karno', 'Jakarta Selatan',
   -6.22640000, 106.79330000, ST_SetSRID(ST_MakePoint(106.79330000, -6.22640000), 4326), 15000000.00, 7500000.00, 'active'),
  (landlord_id, '1BR Pancoran Riverside', 'pancoran-riverside-tower-a-0908', 'Pancoran Riverside Apartment', '0908', 'Tower A',
   1, 1, 40.00, 'Jl. Pancoran Barat II, Pancoran', 'Jakarta Selatan',
   -6.25330000, 106.84000000, ST_SetSRID(ST_MakePoint(106.84000000, -6.25330000), 4326), 5900000.00, 2950000.00, 'active'),

  -- Jakarta Barat
  (landlord_id, '2BR Central Park Residence', 'central-park-ciputra-world-3015', 'Central Park Apartment', '3015', 'Tower Ciputra World',
   2, 2, 68.00, 'Jl. Letjen S. Parman, Grogol Petamburan', 'Jakarta Barat',
   -6.17880000, 106.79300000, ST_SetSRID(ST_MakePoint(106.79300000, -6.17880000), 4326), 11000000.00, 5500000.00, 'active'),
  (landlord_id, '1BR Puri Park View', 'puri-park-view-tower-a-1502', 'Puri Park View', '1502', 'Tower A',
   1, 1, 42.00, 'Jl. Puri Kencana, Kembangan', 'Jakarta Barat',
   -6.19140000, 106.73530000, ST_SetSRID(ST_MakePoint(106.73530000, -6.19140000), 4326), 5500000.00, 2750000.00, 'active'),
  (landlord_id, '2BR Mediterania Gajah Mada', 'mediterania-gajah-mada-tower-garden-2706', 'Mediterania Gajah Mada', '2706', 'Tower Garden',
   2, 2, 72.00, 'Jl. Gajah Mada No. 8, Tamansari', 'Jakarta Barat',
   -6.14940000, 106.82300000, ST_SetSRID(ST_MakePoint(106.82300000, -6.14940000), 4326), 8200000.00, 4100000.00, 'active'),

  -- Jakarta Utara
  (landlord_id, '2BR Green Bay Pluit Marina', 'green-bay-pluit-marina-2003', 'Green Bay Pluit', '2003', 'Tower Marina',
   2, 2, 85.00, 'Jl. Penjernihan III, Pluit', 'Jakarta Utara',
   -6.11150000, 106.78800000, ST_SetSRID(ST_MakePoint(106.78800000, -6.11150000), 4326), 12000000.00, 6000000.00, 'active'),
  (landlord_id, '1BR Gading Nias', 'gading-nias-tower-b-0811', 'Gading Nias Apartment', '0811', 'Tower B',
   1, 1, 38.00, 'Jl. Raya Boulevard, Kelapa Gading', 'Jakarta Utara',
   -6.16000000, 106.86000000, ST_SetSRID(ST_MakePoint(106.86000000, -6.16000000), 4326), 4800000.00, 2400000.00, 'active'),
  (landlord_id, '3BR Ancol Mansion', 'ancol-mansion-tower-a-2910', 'Ancol Mansion', '2910', 'Tower A',
   3, 3, 130.00, 'Jl. Lodan Timur No. 4, Ancol', 'Jakarta Utara',
   -6.12500000, 106.85000000, ST_SetSRID(ST_MakePoint(106.85000000, -6.12500000), 4326), 16000000.00, 8000000.00, 'active'),

  -- Jakarta Pusat
  (landlord_id, '1BR Menteng Square', 'menteng-square-tower-a-1407', 'Menteng Square', '1407', 'Tower A',
   1, 1, 36.00, 'Jl. Matraman Raya No. 41, Menteng', 'Jakarta Pusat',
   -6.19050000, 106.83000000, ST_SetSRID(ST_MakePoint(106.83000000, -6.19050000), 4326), 6500000.00, 3250000.00, 'active'),
  (landlord_id, '2BR Thamrin Residence', 'thamrin-residence-tower-b-1904', 'Thamrin Residence', '1904', 'Tower B',
   2, 2, 88.00, 'Jl. M.H. Thamrin, Menteng', 'Jakarta Pusat',
   -6.19500000, 106.82200000, ST_SetSRID(ST_MakePoint(106.82200000, -6.19500000), 4326), 14500000.00, 7250000.00, 'active'),

  -- Jakarta Timur
  (landlord_id, '1BR Bassura City', 'bassura-city-tower-a-1705', 'Bassura City', '1705', 'Tower A',
   1, 1, 32.00, 'Jl. Basuki Rachmat No. 1, Duren Sawit', 'Jakarta Timur',
   -6.25000000, 106.88000000, ST_SetSRID(ST_MakePoint(106.88000000, -6.25000000), 4326), 3900000.00, 1950000.00, 'active'),
  (landlord_id, '2BR East Park', 'east-park-tower-b-2109', 'East Park', '2109', 'Tower B',
   2, 2, 75.00, 'Jl. Mayjen Sutoyo, Cawang', 'Jakarta Timur',
   -6.24700000, 106.87200000, ST_SetSRID(ST_MakePoint(106.87200000, -6.24700000), 4326), 6800000.00, 3400000.00, 'active'),

  -- Tangerang
  (landlord_id, '1BR The Nest', 'the-nest-tower-a-1210', 'The Nest Apartment', '1210', 'Tower A',
   1, 1, 42.00, 'Jl. Scientia Boulevard, Curug', 'Tangerang',
   -6.24000000, 106.64000000, ST_SetSRID(ST_MakePoint(106.64000000, -6.24000000), 4326), 4500000.00, 2250000.00, 'active'),
  (landlord_id, '2BR Sky House BSD', 'sky-house-bsd-tower-b-2601', 'Sky House BSD', '2601', 'Tower B',
   2, 2, 70.00, 'Jl. Pahlawan Seribu, BSD City', 'Tangerang',
   -6.30000000, 106.67000000, ST_SetSRID(ST_MakePoint(106.67000000, -6.30000000), 4326), 7900000.00, 3950000.00, 'active'),
  (landlord_id, '2BR Tree Park BSD', 'tree-park-bsd-tower-a-2803', 'Tree Park BSD', '2803', 'Tower A',
   2, 2, 78.00, 'Jl. BSD Raya Utama, BSD City', 'Tangerang',
   -6.28500000, 106.66500000, ST_SetSRID(ST_MakePoint(106.66500000, -6.28500000), 4326), 8400000.00, 4200000.00, 'active'),

  -- Bekasi
  (landlord_id, '1BR Sentra Timur Residence', 'sentra-timur-residence-tower-a-1306', 'Sentra Timur Residence', '1306', 'Tower A',
   1, 1, 30.00, 'Jl. Raya Cakung Cilincing, Cakung', 'Bekasi',
   -6.24500000, 106.91000000, ST_SetSRID(ST_MakePoint(106.91000000, -6.24500000), 4326), 3500000.00, 1750000.00, 'active'),
  (landlord_id, '2BR Grand Duta Mahkota', 'grand-duta-mahkota-tower-b-1604', 'Grand Duta Mahkota', '1604', 'Tower B',
   2, 2, 65.00, 'Jl. Jatiwaringin, Pondok Gede', 'Bekasi',
   -6.28000000, 106.93000000, ST_SetSRID(ST_MakePoint(106.93000000, -6.28000000), 4326), 5200000.00, 2600000.00, 'active'),

  -- Depok
  (landlord_id, '1BR Margonda Residence', 'margonda-residence-tower-a-1109', 'Margonda Residence', '1109', 'Tower A',
   1, 1, 34.00, 'Jl. Margonda Raya No. 8, Pancoran Mas', 'Depok',
   -6.39000000, 106.83000000, ST_SetSRID(ST_MakePoint(106.83000000, -6.39000000), 4326), 3800000.00, 1900000.00, 'active'),
  (landlord_id, '2BR Depok Icon Residence', 'depok-icon-residence-tower-b-2407', 'Depok Icon Residence', '2407', 'Tower B',
   2, 2, 60.00, 'Jl. Margonda Raya No. 1, Beji', 'Depok',
   -6.37200000, 106.82500000, ST_SetSRID(ST_MakePoint(106.82500000, -6.37200000), 4326), 4600000.00, 2300000.00, 'active');

  RAISE NOTICE 'Seeded % apartments.', (SELECT count(*) FROM apartments);
END $$;
