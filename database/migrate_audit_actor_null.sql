-- Migrasi: izinkan actor_id NULL pada security_audit_logs
-- (pencatatan aksi anonim seperti LOGIN_FAILED tanpa user dikenal,
--  serta menghindari kegagalan login karena UUID 'unknown' tidak valid)
ALTER TABLE security_audit_logs
    ALTER COLUMN actor_id DROP NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'security_audit_logs_actor_id_fkey'
          AND conrelid = 'security_audit_logs'::regclass
    ) THEN
        ALTER TABLE security_audit_logs
            DROP CONSTRAINT security_audit_logs_actor_id_fkey;
    END IF;
END $$;
