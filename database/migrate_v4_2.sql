-- Migration: apartment images (Cloudinary URLs) v4.2
-- Run as postgres on VPS: sudo -u postgres psql -d "$DB_NAME" -f /tmp/migrate_v4_2.sql

ALTER TABLE apartments ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

UPDATE apartments SET image_url = image_urls[1] WHERE image_url IS NULL AND image_urls IS NOT NULL AND array_length(image_urls, 1) > 0;
