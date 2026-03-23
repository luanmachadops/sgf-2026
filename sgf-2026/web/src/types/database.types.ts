export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            checklists: {
                Row: {
                    completed_at: string | null
                    driver_id: string
                    has_issues: boolean | null
                    id: string
                    items: Json
                    trip_id: string | null
                    type: Database["public"]["Enums"]["checklist_type"]
                    vehicle_id: string
                }
                Insert: {
                    completed_at?: string | null
                    driver_id: string
                    has_issues?: boolean | null
                    id?: string
                    items: Json
                    trip_id?: string | null
                    type: Database["public"]["Enums"]["checklist_type"]
                    vehicle_id: string
                }
                Update: {
                    completed_at?: string | null
                    driver_id?: string
                    has_issues?: boolean | null
                    id?: string
                    items?: Json
                    trip_id?: string | null
                    type?: Database["public"]["Enums"]["checklist_type"]
                    vehicle_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "checklists_driver_id_fkey"
                        columns: ["driver_id"]
                        isOneToOne: false
                        referencedRelation: "drivers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "checklists_trip_id_fkey"
                        columns: ["trip_id"]
                        isOneToOne: false
                        referencedRelation: "trips"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "checklists_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            departments: {
                Row: {
                    code: string
                    created_at: string | null
                    id: string
                    name: string
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            drivers: {
                Row: {
                    cnh_category: string
                    cnh_expiry_date: string
                    cnh_number: string
                    cpf: string
                    created_at: string | null
                    department_id: string | null
                    email: string | null
                    id: string
                    name: string
                    password_hash: string | null
                    phone: string | null
                    registration_number: string
                    score: number | null
                    status: Database["public"]["Enums"]["driver_status"]
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    cnh_category: string
                    cnh_expiry_date: string
                    cnh_number: string
                    cpf: string
                    created_at?: string | null
                    department_id?: string | null
                    email?: string | null
                    id?: string
                    name: string
                    password_hash?: string | null
                    phone?: string | null
                    registration_number: string
                    score?: number | null
                    status?: Database["public"]["Enums"]["driver_status"]
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    cnh_category?: string
                    cnh_expiry_date?: string
                    cnh_number?: string
                    cpf?: string
                    created_at?: string | null
                    department_id?: string | null
                    email?: string | null
                    id?: string
                    name?: string
                    password_hash?: string | null
                    phone?: string | null
                    registration_number?: string
                    score?: number | null
                    status?: Database["public"]["Enums"]["driver_status"]
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "drivers_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                ]
            }
            maintenances: {
                Row: {
                    actual_cost: number | null
                    approved_at: string | null
                    approved_by: string | null
                    category: Database["public"]["Enums"]["maintenance_category"]
                    created_at: string | null
                    description: string
                    estimated_cost: number | null
                    id: string
                    requested_by: string
                    status: Database["public"]["Enums"]["maintenance_status"]
                    type: Database["public"]["Enums"]["maintenance_type"]
                    updated_at: string | null
                    urgency: number
                    vehicle_id: string
                }
                Insert: {
                    actual_cost?: number | null
                    approved_at?: string | null
                    approved_by?: string | null
                    category: Database["public"]["Enums"]["maintenance_category"]
                    created_at?: string | null
                    description: string
                    estimated_cost?: number | null
                    id?: string
                    requested_by: string
                    status?: Database["public"]["Enums"]["maintenance_status"]
                    type: Database["public"]["Enums"]["maintenance_type"]
                    updated_at?: string | null
                    urgency: number
                    vehicle_id: string
                }
                Update: {
                    actual_cost?: number | null
                    approved_at?: string | null
                    approved_by?: string | null
                    category?: Database["public"]["Enums"]["maintenance_category"]
                    created_at?: string | null
                    description?: string
                    estimated_cost?: number | null
                    id?: string
                    requested_by?: string
                    status?: Database["public"]["Enums"]["maintenance_status"]
                    type?: Database["public"]["Enums"]["maintenance_type"]
                    updated_at?: string | null
                    urgency?: number
                    vehicle_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "maintenances_approved_by_fkey"
                        columns: ["approved_by"]
                        isOneToOne: false
                        referencedRelation: "drivers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "maintenances_requested_by_fkey"
                        columns: ["requested_by"]
                        isOneToOne: false
                        referencedRelation: "drivers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "maintenances_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            refuelings: {
                Row: {
                    anomaly_type: string | null
                    created_at: string | null
                    date: string | null
                    driver_id: string
                    fuel_type: string
                    has_anomaly: boolean | null
                    id: string
                    km_per_liter: number | null
                    liters: number
                    location: unknown
                    odometer: number
                    photo_dashboard_url: string | null
                    photo_receipt_url: string | null
                    supplier_name: string
                    total_cost: number
                    trip_id: string | null
                    validated_at: string | null
                    validated_by: string | null
                    vehicle_id: string
                }
                Insert: {
                    anomaly_type?: string | null
                    created_at?: string | null
                    date?: string | null
                    driver_id: string
                    fuel_type: string
                    has_anomaly?: boolean | null
                    id?: string
                    km_per_liter?: number | null
                    liters: number
                    location?: unknown
                    odometer: number
                    photo_dashboard_url?: string | null
                    photo_receipt_url?: string | null
                    supplier_name: string
                    total_cost: number
                    trip_id?: string | null
                    validated_at?: string | null
                    validated_by?: string | null
                    vehicle_id: string
                }
                Update: {
                    anomaly_type?: string | null
                    created_at?: string | null
                    date?: string | null
                    driver_id?: string
                    fuel_type?: string
                    has_anomaly?: boolean | null
                    id?: string
                    km_per_liter?: number | null
                    liters?: number
                    location?: unknown
                    odometer?: number
                    photo_dashboard_url?: string | null
                    photo_receipt_url?: string | null
                    supplier_name?: string
                    total_cost?: number
                    trip_id?: string | null
                    validated_at?: string | null
                    validated_by?: string | null
                    vehicle_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "refuelings_driver_id_fkey"
                        columns: ["driver_id"]
                        isOneToOne: false
                        referencedRelation: "drivers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "refuelings_trip_id_fkey"
                        columns: ["trip_id"]
                        isOneToOne: false
                        referencedRelation: "trips"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "refuelings_validated_by_fkey"
                        columns: ["validated_by"]
                        isOneToOne: false
                        referencedRelation: "drivers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "refuelings_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            trips: {
                Row: {
                    actual_distance_km: number | null
                    created_at: string | null
                    destination: string
                    driver_id: string
                    end_location: unknown
                    end_odometer: number | null
                    end_time: string | null
                    estimated_distance_km: number | null
                    has_anomaly: boolean | null
                    id: string
                    start_location: unknown
                    start_odometer: number
                    start_time: string
                    status: Database["public"]["Enums"]["trip_status"]
                    vehicle_id: string
                }
                Insert: {
                    actual_distance_km?: number | null
                    created_at?: string | null
                    destination: string
                    driver_id: string
                    end_location?: unknown
                    end_odometer?: number | null
                    end_time?: string | null
                    estimated_distance_km?: number | null
                    has_anomaly?: boolean | null
                    id?: string
                    start_location?: unknown
                    start_odometer: number
                    start_time?: string
                    status?: Database["public"]["Enums"]["trip_status"]
                    vehicle_id: string
                }
                Update: {
                    actual_distance_km?: number | null
                    created_at?: string | null
                    destination?: string
                    driver_id?: string
                    end_location?: unknown
                    end_odometer?: number | null
                    end_time?: string | null
                    estimated_distance_km?: number | null
                    has_anomaly?: boolean | null
                    id?: string
                    start_location?: unknown
                    start_odometer?: number
                    start_time?: string
                    status?: Database["public"]["Enums"]["trip_status"]
                    vehicle_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "trips_driver_id_fkey"
                        columns: ["driver_id"]
                        isOneToOne: false
                        referencedRelation: "drivers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "trips_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string | null
                    department_id: string | null
                    email: string
                    id: string
                    name: string
                    password_hash: string | null
                    role: Database["public"]["Enums"]["user_role"]
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    department_id?: string | null
                    email: string
                    id?: string
                    name: string
                    password_hash?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    department_id?: string | null
                    email?: string
                    id?: string
                    name?: string
                    password_hash?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "users_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                ]
            }
            vehicles: {
                Row: {
                    brand: string
                    created_at: string | null
                    current_odometer: number
                    department_id: string | null
                    fuel_type: Database["public"]["Enums"]["fuel_type"]
                    id: string
                    model: string
                    photo_url: string | null
                    plate: string
                    qr_code_hash: string
                    status: Database["public"]["Enums"]["vehicle_status"]
                    tank_capacity: number
                    updated_at: string | null
                    year: number
                }
                Insert: {
                    brand: string
                    created_at?: string | null
                    current_odometer?: number
                    department_id?: string | null
                    fuel_type: Database["public"]["Enums"]["fuel_type"]
                    id?: string
                    model: string
                    photo_url?: string | null
                    plate: string
                    qr_code_hash: string
                    status?: Database["public"]["Enums"]["vehicle_status"]
                    tank_capacity: number
                    updated_at?: string | null
                    year: number
                }
                Update: {
                    brand?: string
                    created_at?: string | null
                    current_odometer?: number
                    department_id?: string | null
                    fuel_type?: Database["public"]["Enums"]["fuel_type"]
                    id?: string
                    model?: string
                    photo_url?: string | null
                    plate?: string
                    qr_code_hash?: string
                    status?: Database["public"]["Enums"]["vehicle_status"]
                    tank_capacity?: number
                    updated_at?: string | null
                    year?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "vehicles_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {}
        Functions: {
            get_user_department_id: { Args: Record<string, never>; Returns: string }
            is_admin: { Args: Record<string, never>; Returns: boolean }
            is_admin_or_manager: { Args: Record<string, never>; Returns: boolean }
            is_manager: { Args: Record<string, never>; Returns: boolean }
        }
        Enums: {
            checklist_type: "PRE_TRIP" | "POST_TRIP"
            driver_status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
            fuel_type: "DIESEL" | "GASOLINE" | "ETHANOL" | "FLEX"
            maintenance_category: "MECHANICAL" | "ELECTRICAL" | "TIRES" | "BODY"
            maintenance_status:
            | "PENDING"
            | "APPROVED"
            | "REJECTED"
            | "IN_PROGRESS"
            | "COMPLETED"
            maintenance_type: "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY"
            trip_status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
            user_role: "ADMIN" | "MANAGER" | "VIEWER"
            vehicle_status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "INACTIVE"
        }
        CompositeTypes: {}
    }
}

// Convenience type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
    Database["public"]["Enums"][T]
