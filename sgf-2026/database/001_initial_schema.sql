-- Migration: 001_initial_schema
-- Description: Cria todas as tabelas principais do SGF 2026

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ====================================
-- TABELA: departments (Secretarias)
-- ====================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- TABELA: vehicles (Veículos)
-- ====================================
CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE fuel_type AS ENUM ('DIESEL', 'GASOLINE', 'ETHANOL', 'FLEX');

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(10) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    fuel_type fuel_type NOT NULL,
    tank_capacity DECIMAL(10, 2) NOT NULL,
    current_odometer INTEGER NOT NULL DEFAULT 0,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status vehicle_status NOT NULL DEFAULT 'AVAILABLE',
    qr_code_hash VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_department ON vehicles(department_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_qr_code ON vehicles(qr_code_hash);

-- ====================================
-- TABELA: drivers (Motoristas)
-- ====================================
CREATE TYPE driver_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpf VARCHAR(11) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    cnh_number VARCHAR(20) NOT NULL,
    cnh_category VARCHAR(10) NOT NULL,
    cnh_expiry_date DATE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    password_hash TEXT NOT NULL,
    score DECIMAL(3, 2) DEFAULT 5.00,
    status driver_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drivers_cpf ON drivers(cpf);
CREATE INDEX idx_drivers_department ON drivers(department_id);
CREATE INDEX idx_drivers_status ON drivers(status);

-- ====================================
-- TABELA: trips (Viagens)
-- ====================================
CREATE TYPE trip_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    estimated_distance_km DECIMAL(10, 2),
    actual_distance_km DECIMAL(10, 2),
    start_odometer INTEGER NOT NULL,
    end_odometer INTEGER,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    start_location GEOGRAPHY(POINT, 4326),
    end_location GEOGRAPHY(POINT, 4326),
    status trip_status NOT NULL DEFAULT 'IN_PROGRESS',
    has_anomaly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_start_time ON trips(start_time);
CREATE INDEX idx_trips_anomaly ON trips(has_anomaly);

-- ====================================
-- TABELA: refuelings (Abastecimentos)
-- ====================================
CREATE TABLE refuelings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    liters DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    odometer INTEGER NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    photo_dashboard_url TEXT,
    photo_receipt_url TEXT,
    location GEOGRAPHY(POINT, 4326),
    km_per_liter DECIMAL(10, 2),
    has_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_type VARCHAR(100),
    validated_at TIMESTAMP WITH TIME ZONE,
    validated_by UUID REFERENCES drivers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refuelings_vehicle ON refuelings(vehicle_id);
CREATE INDEX idx_refuelings_driver ON refuelings(driver_id);
CREATE INDEX idx_refuelings_trip ON refuelings(trip_id);
CREATE INDEX idx_refuelings_anomaly ON refuelings(has_anomaly);
CREATE INDEX idx_refuelings_created ON refuelings(created_at);

-- ====================================
-- TABELA: maintenances (Manutenções)
-- ====================================
CREATE TYPE maintenance_type AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY');
CREATE TYPE maintenance_category AS ENUM ('MECHANICAL', 'ELECTRICAL', 'TIRES', 'BODY');
CREATE TYPE maintenance_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE maintenances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    type maintenance_type NOT NULL,
    category maintenance_category NOT NULL,
    description TEXT NOT NULL,
    urgency INTEGER NOT NULL CHECK (urgency >= 1 AND urgency <= 5),
    status maintenance_status NOT NULL DEFAULT 'PENDING',
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    approved_by UUID REFERENCES drivers(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_maintenances_vehicle ON maintenances(vehicle_id);
CREATE INDEX idx_maintenances_status ON maintenances(status);
CREATE INDEX idx_maintenances_urgency ON maintenances(urgency);
CREATE INDEX idx_maintenances_created ON maintenances(created_at);

-- ====================================
-- TABELA: checklists (Checklists)
-- ====================================
CREATE TYPE checklist_type AS ENUM ('PRE_TRIP', 'POST_TRIP');

CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    type checklist_type NOT NULL,
    has_issues BOOLEAN DEFAULT FALSE,
    items JSONB NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_checklists_vehicle ON checklists(vehicle_id);
CREATE INDEX idx_checklists_driver ON checklists(driver_id);
CREATE INDEX idx_checklists_trip ON checklists(trip_id);
CREATE INDEX idx_checklists_has_issues ON checklists(has_issues);

-- ====================================
-- TABELA: users (Usuários do painel web)
-- ====================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'VIEWER');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'VIEWER',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ====================================
-- FUNÇÕES AUXILIARES
-- ====================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenances_updated_at BEFORE UPDATE ON maintenances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- COMENTÁRIOS
-- ====================================
COMMENT ON TABLE departments IS 'Secretarias municipais';
COMMENT ON TABLE vehicles IS 'Veículos da frota municipal';
COMMENT ON TABLE drivers IS 'Motoristas autorizados';
COMMENT ON TABLE trips IS 'Registro de viagens realizadas';
COMMENT ON TABLE refuelings IS 'Registro de abastecimentos';
COMMENT ON TABLE maintenances IS 'Solicitações e registros de manutenção';
COMMENT ON TABLE checklists IS 'Checklists de inspeção pré e pós viagem';
COMMENT ON TABLE users IS 'Usuários do painel administrativo web';
