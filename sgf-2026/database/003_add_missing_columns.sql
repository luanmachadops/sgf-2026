-- Migration: 003_add_missing_columns
-- Description: Adiciona colunas necessárias que faltam no schema inicial
-- Aplicar no Supabase SQL Editor antes da migration 004_enable_rls.sql

-- ====================================
-- COLUNA: users.user_id
-- Link entre a tabela users e auth.users do Supabase
-- Necessário para RLS (auth.uid() -> users.user_id -> users.role)
-- ====================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- ====================================
-- COLUNA: vehicles.photo_url
-- URL da foto do veículo (Storage Supabase ou URL externa)
-- ====================================
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ====================================
-- DATA FIX: Preencher user_id para usuários já existentes
-- Rode este bloco APÓS criar os usuários no Supabase Auth
-- e vinculá-los pelo email.
-- ====================================
-- UPDATE users u
-- SET user_id = a.id
-- FROM auth.users a
-- WHERE a.email = u.email
--   AND u.user_id IS NULL;
