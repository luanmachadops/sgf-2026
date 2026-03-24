-- Migration: 006_driver_auth_alignment
-- Description: Alinha a tabela drivers com o fluxo de autenticação via Supabase Auth

ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);

ALTER TABLE drivers
ALTER COLUMN password_hash DROP NOT NULL;
