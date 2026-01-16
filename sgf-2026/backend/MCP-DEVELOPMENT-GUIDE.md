# Guia de Desenvolvimento com MCP Supabase

## Setup Inicial

O backend SGF 2026 está pronto, mas a conexão local TypeORM requer IPv6. Durante o desenvolvimento local, use o **MCP do Supabase** para operações de banco.

## Comandos Úteis via MCP

### Consultar Dados

```typescript
// Listar motoristas
mcp_supabase-mcp-server_execute_sql({
  project_id: "ghvbydtytdxdgviuunvm",
  query: "SELECT id, name, cpf, status FROM drivers LIMIT 10;"
})

// Listar veículos disponíveis
mcp_supabase-mcp-server_execute_sql({
  project_id: "ghvbydtytdxdgviuunvm",
  query: "SELECT plate, model, status FROM vehicles WHERE status = 'AVAILABLE';"
})
```

### Inserir Dados de Teste

```typescript
// Criar novo motorista
mcp_supabase-mcp-server_execute_sql({
  project_id: "ghvbydtytdxdgviuunvm",
  query: `
    INSERT INTO drivers (cpf, name, registration_number, cnh_number, 
                         cnh_category, cnh_expiry, password_hash, status)
    VALUES ('11122233344', 'Pedro Testador', 'MT099', '11122233355',
            'D', '2027-12-31', 
            '$2b$10$example', 'ACTIVE')
    RETURNING *;
  `
})
```

### Testar Fluxos Principais

```typescript
// Simular início de viagem
mcp_supabase-mcp-server_execute_sql({
  project_id: "ghvbydtytdxdgviuunvm",
  query: `
    INSERT INTO trips (vehicle_id, driver_id, destination, 
                       start_odometer, estimated_distance_km)
    SELECT 
      v.id, 
      d.id,
      'Centro Administrativo',
      v.current_odometer,
      15.5
    FROM vehicles v, drivers d
    WHERE v.plate = 'ABC1234' 
      AND d.cpf = '12345678901'
    RETURNING *;
  `
})
```

## Verificar Implementações

### RF-007: Checklist com Item Crítico

```typescript
mcp_supabase-mcp-server_execute_sql({
  project_id: "ghvbydtytdxdgviuunvm",
  query: `
    -- Verificar se bloqueio funciona
    SELECT * FROM checklists 
    WHERE type = 'PRE_TRIP' 
      AND has_issues = true;
  `
})
```

### RF-014: Anti-Fraude Abastecimento

```typescript
mcp_supabase-mcp-server_execute_sql({
  project_id: "ghvbydtytdxdgviuunvm",
  query: `
    -- Listar abastecimentos com anomalias
    SELECT * FROM refuelings 
    WHERE anomaly_flags IS NOT NULL;
  `
})
```

## Credenciais de Teste

**Admin:**
- Email: `admin@sgf.gov.br`
- Senha: `Admin@123`

**Motorista:**
- CPF: `12345678901`
- Senha: `driver123`

## Deploy Futuro

Quando fizer deploy em produção (Vercel, Railway, etc.), o TypeORM funcionará normalmente com IPv6 ou após adicionar o IPv4 add-on do Supabase ($4/mês).
