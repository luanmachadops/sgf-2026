-- Migration: 002_seed_data
-- Description: Dados iniciais para desenvolvimento e teste

-- ====================================
-- SEED: Secretarias
-- ====================================
INSERT INTO departments (id, name, code) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Secretaria de Saúde', 'SESAU'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Secretaria de Educação', 'SEMED'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Secretaria de Obras', 'SEMOB'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Secretaria de Assistência Social', 'SEMAS'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Secretaria de Meio Ambiente', 'SEMMA');

-- ====================================
-- SEED: Veículos
-- ====================================
INSERT INTO vehicles (id, plate, brand, model, year, fuel_type, tank_capacity, current_odometer, department_id, status, qr_code_hash) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'ABC1234', 'Volkswagen', 'Gol', 2020, 'FLEX', 50.0, 45000, '550e8400-e29b-41d4-a716-446655440001', 'AVAILABLE', 'QR_ABC1234_HASH_001'),
    ('660e8400-e29b-41d4-a716-446655440002', 'DEF5678', 'Fiat', 'Uno', 2019, 'FLEX', 45.0, 62000, '550e8400-e29b-41d4-a716-446655440002', 'AVAILABLE', 'QR_DEF5678_HASH_002'),
    ('660e8400-e29b-41d4-a716-446655440003', 'GHI9012', 'Ford', 'Ranger', 2021, 'DIESEL', 80.0, 35000, '550e8400-e29b-41d4-a716-446655440003', 'IN_USE', 'QR_GHI9012_HASH_003'),
    ('660e8400-e29b-41d4-a716-446655440004', 'JKL3456', 'Chevrolet', 'S10', 2022, 'DIESEL', 76.0, 18000, '550e8400-e29b-41d4-a716-446655440001', 'AVAILABLE', 'QR_JKL3456_HASH_004'),
    ('660e8400-e29b-41d4-a716-446655440005', 'MNO7890', 'Toyota', 'Hilux', 2023, 'DIESEL', 80.0, 8000, '550e8400-e29b-41d4-a716-446655440003', 'MAINTENANCE', 'QR_MNO7890_HASH_005'),
    ('660e8400-e29b-41d4-a716-446655440006', 'PQR1122', 'Renault', 'Duster', 2020, 'FLEX', 50.0, 55000, '550e8400-e29b-41d4-a716-446655440004', 'AVAILABLE', 'QR_PQR1122_HASH_006'),
    ('660e8400-e29b-41d4-a716-446655440007', 'STU3344', 'Volkswagen', 'Saveiro', 2021, 'FLEX', 55.0, 32000, '550e8400-e29b-41d4-a716-446655440005', 'AVAILABLE', 'QR_STU3344_HASH_007'),
    ('660e8400-e29b-41d4-a716-446655440008', 'VWX5566', 'Fiat', 'Toro', 2022, 'DIESEL', 60.0, 22000, '550e8400-e29b-41d4-a716-446655440002', 'IN_USE', 'QR_VWX5566_HASH_008');

-- ====================================
-- SEED: Motoristas
-- ====================================
-- Senha padrão para todos: "senha123" (hash bcrypt)
INSERT INTO drivers (id, cpf, name, registration_number, cnh_number, cnh_category, cnh_expiry_date, department_id, phone, email, password_hash, score, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '12345678901', 'João Silva', 'MT001', '12345678900', 'B', '2026-12-31', '550e8400-e29b-41d4-a716-446655440001', '11987654321', 'joao.silva@prefeitura.gov.br', '$2b$10$rZ3qJKx.qN0vXJZ0QqZ0QeZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0Q', 4.85, 'ACTIVE'),
    ('770e8400-e29b-41d4-a716-446655440002', '23456789012', 'Maria Santos', 'MT002', '23456789011', 'AB', '2027-06-15', '550e8400-e29b-41d4-a716-446655440002', '11987654322', 'maria.santos@prefeitura.gov.br', '$2b$10$rZ3qJKx.qN0vXJZ0QqZ0QeZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0Q', 4.92, 'ACTIVE'),
    ('770e8400-e29b-41d4-a716-446655440003', '34567890123', 'Carlos Oliveira', 'MT003', '34567890122', 'D', '2025-03-20', '550e8400-e29b-41d4-a716-446655440003', '11987654323', 'carlos.oliveira@prefeitura.gov.br', '$2b$10$rZ3qJKx.qN0vXJZ0QqZ0QeZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0Q', 4.67, 'ACTIVE'),
    ('770e8400-e29b-41d4-a716-446655440004', '45678901234', 'Ana Costa', 'MT004', '45678901233', 'B', '2026-09-10', '550e8400-e29b-41d4-a716-446655440004', '11987654324', 'ana.costa@prefeitura.gov.br', '$2b$10$rZ3qJKx.qN0vXJZ0QqZ0QeZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0Q', 5.00, 'ACTIVE'),
    ('770e8400-e29b-41d4-a716-446655440005', '56789012345', 'Pedro Almeida', 'MT005', '56789012344', 'AB', '2027-11-25', '550e8400-e29b-41d4-a716-446655440005', '11987654325', 'pedro.almeida@prefeitura.gov.br', '$2b$10$rZ3qJKx.qN0vXJZ0QqZ0QeZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0Q', 4.78, 'ACTIVE'),
    ('770e8400-e29b-41d4-a716-446655440006', '67890123456', 'Juliana Ferreira', 'MT006', '67890123455', 'B', '2026-01-30', '550e8400-e29b-41d4-a716-446655440001', '11987654326', 'juliana.ferreira@prefeitura.gov.br', '$2b$10$rZ3qJKx.qN0vXJZ0QqZ0QeZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0QqZ0Q', 4.55, 'ACTIVE');

-- ====================================
-- SEED: Usuários do Painel Web
-- ====================================
-- Senha padrão para todos: "admin123" (hash bcrypt)
INSERT INTO users (id, email, password_hash, name, role, department_id) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', 'admin@prefeitura.gov.br', '$2b$10$admin123hash', 'Administrador Geral', 'ADMIN', NULL),
    ('880e8400-e29b-41d4-a716-446655440002', 'gestor.saude@prefeitura.gov.br', '$2b$10$admin123hash', 'Gestor de Saúde', 'MANAGER', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440003', 'gestor.educacao@prefeitura.gov.br', '$2b$10$admin123hash', 'Gestor de Educação', 'MANAGER', '550e8400-e29b-41d4-a716-446655440002');

-- ====================================
-- SEED: Viagens (Exemplos)
-- ====================================
INSERT INTO trips (id, vehicle_id, driver_id, destination, estimated_distance_km, actual_distance_km, start_odometer, end_odometer, start_time, end_time, status, has_anomaly) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Hospital Central', 15.0, 15.5, 34950, 34965, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'COMPLETED', FALSE),
    ('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440002', 'Escola Municipal do Centro', 8.0, NULL, 21995, NULL, NOW() - INTERVAL '30 minutes', NULL, 'IN_PROGRESS', FALSE);

-- ====================================
-- SEED: Abastecimentos (Exemplos)
-- ====================================
INSERT INTO refuelings (id, vehicle_id, driver_id, trip_id, liters, total_cost, odometer, fuel_type, supplier_name, km_per_liter, has_anomaly) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', NULL, 42.5, 255.00, 44850, 'GASOLINE', 'Posto Petrobras Centro', 11.2, FALSE),
    ('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 65.0, 455.00, 34900, 'DIESEL', 'Posto Shell Rodovia', 9.8, FALSE);

-- ====================================
-- SEED: Manutenções (Exemplos)
-- ====================================
INSERT INTO maintenances (id, vehicle_id, requested_by, type, category, description, urgency, status, estimated_cost) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'PREVENTIVE', 'MECHANICAL', 'Troca de óleo e filtros', 3, 'IN_PROGRESS', 350.00),
    ('bb0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'CORRECTIVE', 'ELECTRICAL', 'Problema na luz do freio', 4, 'PENDING', 150.00);
