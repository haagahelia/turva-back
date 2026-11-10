ALTER TABLE TurvaUser
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'turvauser_role_check'
    )   THEN
        ALTER TABLE TurvaUser
        ADD CONSTRAINT turvauser_role_check
        CHECK (role IN ('user', 'admin'));
    END IF;
END
$$;
