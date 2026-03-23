-- Migration: 004_enable_rls
-- Description: Habilita Row Level Security em todas as tabelas e define policies por role.
-- ATENÇÃO: Aplicar DEPOIS da migration 003_add_missing_columns.sql.
-- ATENÇÃO: Garanta que os usuários já têm user_id preenchido antes de aplicar.
--
-- Roles no sistema:
--   ADMIN   → acesso total a todos os dados
--   MANAGER → acesso total apenas ao department_id do seu perfil
--   VIEWER  → somente leitura em todos os dados
--
-- Motoristas acessam via backend NestJS com supabaseAdmin (service_role),
-- portanto não precisam de policies específicas aqui.

-- ====================================
-- FUNÇÕES AUXILIARES
-- Usam SECURITY DEFINER para ler a tabela users sem loop de RLS.
-- STABLE = Postgres pode cachear o resultado por consulta.
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_department_id()
RETURNS UUID AS $$
  SELECT department_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ====================================
-- DEPARTMENTS
-- Todos authenticated podem ler (necessário para selects com JOIN).
-- Apenas ADMIN pode escrever.
-- ====================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_select" ON departments;
DROP POLICY IF EXISTS "departments_admin_write" ON departments;

CREATE POLICY "departments_select"
ON departments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "departments_admin_write"
ON departments FOR ALL TO authenticated
USING (get_user_role() = 'ADMIN')
WITH CHECK (get_user_role() = 'ADMIN');

-- ====================================
-- VEHICLES
-- ADMIN: tudo
-- MANAGER: apenas seu department_id
-- VIEWER: somente leitura de todos
-- ====================================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "vehicles_insert" ON vehicles;
DROP POLICY IF EXISTS "vehicles_update" ON vehicles;
DROP POLICY IF EXISTS "vehicles_delete" ON vehicles;

CREATE POLICY "vehicles_select"
ON vehicles FOR SELECT TO authenticated
USING (
  get_user_role() IN ('ADMIN', 'VIEWER')
  OR (get_user_role() = 'MANAGER' AND department_id = get_user_department_id())
  OR department_id IS NULL
);

CREATE POLICY "vehicles_insert"
ON vehicles FOR INSERT TO authenticated
WITH CHECK (
  get_user_role() = 'ADMIN'
  OR (get_user_role() = 'MANAGER' AND department_id = get_user_department_id())
);

CREATE POLICY "vehicles_update"
ON vehicles FOR UPDATE TO authenticated
USING (
  get_user_role() = 'ADMIN'
  OR (get_user_role() = 'MANAGER' AND department_id = get_user_department_id())
)
WITH CHECK (
  get_user_role() = 'ADMIN'
  OR (get_user_role() = 'MANAGER' AND department_id = get_user_department_id())
);

CREATE POLICY "vehicles_delete"
ON vehicles FOR DELETE TO authenticated
USING (get_user_role() = 'ADMIN');

-- ====================================
-- DRIVERS
-- ADMIN: tudo
-- MANAGER: apenas seu department_id
-- VIEWER: somente leitura de todos
-- ====================================
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drivers_select" ON drivers;
DROP POLICY IF EXISTS "drivers_insert" ON drivers;
DROP POLICY IF EXISTS "drivers_update" ON drivers;
DROP POLICY IF EXISTS "drivers_delete" ON drivers;

CREATE POLICY "drivers_select"
ON drivers FOR SELECT TO authenticated
USING (
  get_user_role() IN ('ADMIN', 'VIEWER')
  OR (get_user_role() = 'MANAGER' AND department_id = get_user_department_id())
  OR department_id IS NULL
);

CREATE POLICY "drivers_insert"
ON drivers FOR INSERT TO authenticated
WITH CHECK (
  get_user_role() = 'ADMIN'
  OR (get_user_role() = 'MANAGER' AND department_id = get_user_department_id())
);

CREATE POLICY "drivers_update"
ON drivers FOR UPDATE TO authenticated
USING (
  get_user_role() = 'ADMIN'
  OR (get_user_role() = 'MANAGER' AND department_id = get_user_department_id())
);

CREATE POLICY "drivers_delete"
ON drivers FOR DELETE TO authenticated
USING (get_user_role() = 'ADMIN');

-- ====================================
-- TRIPS
-- Acesso determinado pelo department_id do veículo associado.
-- ADMIN e VIEWER: todos os registros
-- MANAGER: apenas viagens de veículos do seu departamento
-- ====================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trips_select" ON trips;
DROP POLICY IF EXISTS "trips_insert" ON trips;
DROP POLICY IF EXISTS "trips_update" ON trips;
DROP POLICY IF EXISTS "trips_delete" ON trips;

CREATE POLICY "trips_select"
ON trips FOR SELECT TO authenticated
USING (
  get_user_role() IN ('ADMIN', 'VIEWER')
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "trips_insert"
ON trips FOR INSERT TO authenticated
WITH CHECK (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "trips_update"
ON trips FOR UPDATE TO authenticated
USING (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "trips_delete"
ON trips FOR DELETE TO authenticated
USING (get_user_role() = 'ADMIN');

-- ====================================
-- REFUELINGS
-- Acesso determinado pelo department_id do veículo associado.
-- ====================================
ALTER TABLE refuelings ENABLE ROW LEVEL SECURITY;
ALTER TABLE refuelings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "refuelings_select" ON refuelings;
DROP POLICY IF EXISTS "refuelings_insert" ON refuelings;
DROP POLICY IF EXISTS "refuelings_update" ON refuelings;
DROP POLICY IF EXISTS "refuelings_delete" ON refuelings;

CREATE POLICY "refuelings_select"
ON refuelings FOR SELECT TO authenticated
USING (
  get_user_role() IN ('ADMIN', 'VIEWER')
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "refuelings_insert"
ON refuelings FOR INSERT TO authenticated
WITH CHECK (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "refuelings_update"
ON refuelings FOR UPDATE TO authenticated
USING (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "refuelings_delete"
ON refuelings FOR DELETE TO authenticated
USING (get_user_role() = 'ADMIN');

-- ====================================
-- MAINTENANCES
-- Acesso determinado pelo department_id do veículo associado.
-- ====================================
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maintenances_select" ON maintenances;
DROP POLICY IF EXISTS "maintenances_insert" ON maintenances;
DROP POLICY IF EXISTS "maintenances_update" ON maintenances;
DROP POLICY IF EXISTS "maintenances_delete" ON maintenances;

CREATE POLICY "maintenances_select"
ON maintenances FOR SELECT TO authenticated
USING (
  get_user_role() IN ('ADMIN', 'VIEWER')
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "maintenances_insert"
ON maintenances FOR INSERT TO authenticated
WITH CHECK (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "maintenances_update"
ON maintenances FOR UPDATE TO authenticated
USING (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "maintenances_delete"
ON maintenances FOR DELETE TO authenticated
USING (get_user_role() = 'ADMIN');

-- ====================================
-- CHECKLISTS
-- Acesso determinado pelo department_id do veículo associado.
-- ====================================
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checklists_select" ON checklists;
DROP POLICY IF EXISTS "checklists_insert" ON checklists;
DROP POLICY IF EXISTS "checklists_update" ON checklists;
DROP POLICY IF EXISTS "checklists_delete" ON checklists;

CREATE POLICY "checklists_select"
ON checklists FOR SELECT TO authenticated
USING (
  get_user_role() IN ('ADMIN', 'VIEWER')
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "checklists_insert"
ON checklists FOR INSERT TO authenticated
WITH CHECK (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "checklists_update"
ON checklists FOR UPDATE TO authenticated
USING (
  get_user_role() = 'ADMIN'
  OR EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = vehicle_id
    AND v.department_id = get_user_department_id()
  )
);

CREATE POLICY "checklists_delete"
ON checklists FOR DELETE TO authenticated
USING (get_user_role() = 'ADMIN');

-- ====================================
-- USERS
-- ADMIN: acesso total
-- Outros: somente ver e editar o próprio perfil
-- ====================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;

CREATE POLICY "users_select_own"
ON users FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_user_role() = 'ADMIN');

CREATE POLICY "users_update_own"
ON users FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR get_user_role() = 'ADMIN')
WITH CHECK (user_id = auth.uid() OR get_user_role() = 'ADMIN');

CREATE POLICY "users_admin_insert"
ON users FOR INSERT TO authenticated
WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "users_admin_delete"
ON users FOR DELETE TO authenticated
USING (get_user_role() = 'ADMIN');
