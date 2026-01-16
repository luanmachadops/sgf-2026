# SGF 2026 — Sistema de Gestão de Frotas Municipal
## Documentação Técnica e PRD Completo

**Versão:** 2.0  
**Data:** Janeiro 2026  
**Setor:** Obras e Garagem Municipal  
**Cores do Sistema:** HSL(188°, 49%, 12%) | HSL(160°, 100%, 33%) | HSL(161°, 33%, 60%)

---

# PARTE 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

---

## 1. Visão Geral do Produto

### 1.1 Problema a Resolver

As prefeituras brasileiras enfrentam desafios críticos na gestão de suas frotas municipais:

- **Fraudes em abastecimento:** Combustível desviado ou registros falsos
- **Falta de rastreabilidade:** Impossibilidade de saber onde os veículos estão em tempo real
- **Manutenção reativa:** Veículos quebram por falta de manutenção preventiva
- **Desperdício de recursos:** Rotas ineficientes e uso indevido de veículos
- **Burocracia em papel:** Diários de bordo físicos passíveis de adulteração
- **Descontrole de motoristas:** CNHs vencidas, condutores não autorizados
- **Falta de prestação de contas:** Dificuldade em gerar relatórios para auditorias

### 1.2 Solução Proposta

O **SGF 2026** é uma plataforma integrada que digitaliza toda a operação de frotas municipais através de dois ecossistemas complementares:

1. **App Operacional (Mobile):** Para motoristas executarem operações em campo
2. **Painel Estratégico (Desktop/CRM):** Para gestores monitorarem e auditarem

### 1.3 Público-Alvo

| Persona | Perfil | Necessidade Principal |
|---------|--------|----------------------|
| Motorista Municipal | Servidor público, 35-55 anos, familiaridade básica com smartphones | Registrar operações rapidamente sem burocracia |
| Gestor de Garagem | Coordenador/Supervisor, 40-60 anos, responsável pelo patrimônio | Controlar veículos, custos e manutenções |
| Secretário de Obras | Cargo político/técnico, foco em resultados | Dashboards executivos e relatórios de auditoria |
| Tribunal de Contas | Órgão fiscalizador | Rastreabilidade completa e exportação de dados |

### 1.4 Objetivos Mensuráveis

| Objetivo | Métrica | Meta |
|----------|---------|------|
| Reduzir fraudes em combustível | % de abastecimentos com prova fotográfica | 100% |
| Aumentar disponibilidade da frota | % de veículos operacionais | ≥ 90% |
| Melhorar rastreabilidade | % de viagens com GPS ativo | 100% |
| Reduzir tempo de registro | Minutos por operação | < 2 min |
| Acelerar auditorias | Tempo para gerar relatório completo | < 5 min |

---

## 2. Escopo do Produto

### 2.1 Funcionalidades Core (MVP)

**App Mobile (Motorista):**
- Autenticação por CPF/Senha
- Vinculação de veículo via QR Code
- Checklist de vistoria pré-viagem
- Registro de início/fim de viagem com GPS
- Registro de abastecimento com fotos obrigatórias
- Solicitação de manutenção com anexos
- Histórico pessoal de viagens

**Painel Desktop (Gestor):**
- Dashboard com KPIs em tempo real
- Mapa de rastreamento ao vivo
- Gestão de veículos (CRUD)
- Gestão de motoristas (CRUD)
- Aprovação de manutenções
- Relatórios exportáveis (PDF/Excel)
- Alertas configuráveis

### 2.2 Funcionalidades Avançadas (Fase 2)

- Integração com sistema de ponto (biometria)
- Cercamento eletrônico (geofencing)
- Score de condução com IA
- Previsão de manutenção com Machine Learning
- Integração com bombas de combustível via NFC
- App para cidadão denunciar uso indevido

### 2.3 Fora do Escopo

- Gestão de multas de trânsito
- Controle de passageiros
- Sistema de reserva de veículos
- Integração com DETRAN

---

## 3. Requisitos Funcionais Detalhados

### 3.1 Módulo de Autenticação

**RF-001: Login do Motorista**
- O sistema deve autenticar motoristas via CPF (11 dígitos) e senha
- Deve suportar biometria do dispositivo como segundo fator opcional
- Sessão expira após 8 horas de inatividade
- Máximo de 3 tentativas de login; após isso, bloqueio de 15 minutos

**RF-002: Login do Gestor**
- Autenticação via email institucional e senha forte
- Obrigatório 2FA via app autenticador
- Controle de permissões por papel (Admin, Gestor, Visualizador)
- Log de todas as ações administrativas

### 3.2 Módulo de Vinculação de Veículo

**RF-003: Escaneamento de QR Code**
- Cada veículo possui QR Code único colado no painel
- QR Code codifica: Placa, ID interno, Secretaria
- Leitura deve funcionar offline (dados cacheados)
- Timeout de leitura: 10 segundos

**RF-004: Vinculação Manual (Fallback)**
- Se QR Code estiver danificado, motorista busca por:
  - Placa (com máscara ABC-1234 ou ABC1D23 Mercosul)
  - Modelo/Marca
  - Secretaria
- Sistema registra que vinculação foi manual (flag de auditoria)

**RF-005: Trava de Veículo**
- Uma vez vinculado, veículo fica "travado" para aquele motorista
- Outro motorista não pode vincular até o primeiro "desvincular"
- Gestor pode forçar desvinculação remotamente (emergência)

### 3.3 Módulo de Vistoria (Checklist)

**RF-006: Checklist Pré-Viagem**
- Lista configurável de itens por categoria de veículo:
  
  **Categoria: Caminhão/Obras**
  - Nível de óleo motor
  - Nível de água do radiador
  - Estado dos pneus (calibragem visual)
  - Funcionamento das luzes (farol, seta, ré)
  - Estado dos retrovisores
  - Funcionamento do freio de mão
  - Presença do triângulo e extintor
  - Condições da carroceria/caçamba
  - Funcionamento do sistema hidráulico (se aplicável)

- Cada item: OK / Problema / N/A
- Se "Problema": campo de texto obrigatório + foto opcional
- Checklist deve ser concluído em < 3 minutos

**RF-007: Bloqueio por Checklist Crítico**
- Itens críticos (ex: freio, pneus) com problema impedem início de viagem
- Sistema gera ordem de serviço automática para oficina
- Gestor recebe notificação push imediata

### 3.4 Módulo de Viagem

**RF-008: Início de Viagem**
- Motorista informa destino (texto livre ou favoritos salvos)
- Sistema calcula:
  - Distância estimada (via API de mapas)
  - Consumo estimado (baseado no veículo)
  - Tempo estimado de chegada
- Registra: data/hora, odômetro inicial, coordenadas GPS

**RF-009: Rastreamento Ativo**
- Durante viagem, app envia coordenadas a cada 30 segundos
- Exibe na tela: velocidade atual, tempo decorrido, km rodados
- Funciona em background com notificação persistente
- Se GPS perder sinal > 5 min, alerta para motorista

**RF-010: Finalização de Viagem**
- Motorista confirma chegada
- Sistema registra: data/hora, odômetro final, coordenadas
- Calcula: distância real vs estimada, tempo real vs estimado
- Se desvio > 20%, flag para auditoria

**RF-011: Paradas Intermediárias**
- Motorista pode registrar paradas (almoço, carga, etc.)
- Tipo de parada: Refeição, Carga/Descarga, Emergência, Pessoal
- Tempo máximo por tipo (configurável pelo gestor)
- Parada > limite gera notificação para gestor

### 3.5 Módulo de Abastecimento

**RF-012: Registro de Abastecimento**
- Campos obrigatórios:
  - Odômetro atual
  - Litros abastecidos
  - Valor total (R$)
  - Posto/Fornecedor (lista pré-cadastrada ou novo)
  - Tipo de combustível (Diesel, Gasolina, Etanol)
  
**RF-013: Comprovação Fotográfica**
- Duas fotos obrigatórias com metadados:
  - **Foto 1:** Painel do veículo mostrando odômetro
  - **Foto 2:** Nota fiscal ou requisição de abastecimento
- Fotos devem ter:
  - Geolocalização (GPS)
  - Data/hora (timestamp do dispositivo)
  - Marca d'água automática com dados do registro
- Fotos sem GPS são rejeitadas (configurável)

**RF-014: Validação Anti-Fraude**
- Sistema valida automaticamente:
  - Odômetro não pode ser menor que último registro
  - Litros não podem exceder capacidade do tanque
  - Km/L calculado deve estar dentro da faixa do veículo (±30%)
  - Localização deve ser compatível com rota (se em viagem)
- Anomalias geram flag + notificação para gestor

### 3.6 Módulo de Manutenção

**RF-015: Solicitação de Manutenção**
- Motorista pode solicitar durante ou fora de viagem
- Categorias:
  - Mecânica (motor, transmissão, suspensão)
  - Elétrica (bateria, alternador, luzes)
  - Pneus (calibragem, troca, rodízio)
  - Carroceria (lataria, vidros, estofamento)
  - Emergência (pane total, acidente)
- Campos: descrição do problema, urgência (1-5), fotos

**RF-016: Workflow de Manutenção**
1. Solicitação criada → Status: "Aguardando Análise"
2. Gestor avalia → Status: "Aprovada" ou "Recusada"
3. Veículo vai para oficina → Status: "Em Manutenção"
4. Serviço concluído → Status: "Aguardando Retirada"
5. Motorista retira → Status: "Concluída"

**RF-017: Manutenção Preventiva Automática**
- Sistema alerta baseado em:
  - Km rodados desde última troca de óleo
  - Tempo desde última revisão
  - Validade de itens (extintor, CNH do motorista)
- Alertas configuráveis (7 dias antes, no dia, vencido)

### 3.7 Módulo de Gestão (Painel)

**RF-018: Dashboard Executivo**
- KPIs em cards:
  - Total de veículos na frota
  - Veículos em operação agora
  - Veículos em manutenção
  - Veículos parados (sem uso > 7 dias)
  - Gasto total combustível (mês)
  - Km total rodados (mês)
- Gráficos:
  - Evolução de gastos (últimos 6 meses)
  - Distribuição por secretaria (pizza)
  - Top 10 veículos mais custosos

**RF-019: Mapa de Rastreamento**
- Visualização em tempo real de todos os veículos
- Cores por status:
  - Verde: Em movimento
  - Azul: Parado com motor ligado
  - Cinza: Desligado
  - Vermelho: Alerta (fora de rota, parado muito tempo)
- Clique no pin: detalhes do veículo e motorista
- Histórico de rota por período

**RF-020: Gestão de Veículos**
- CRUD completo de veículos
- Campos: Placa, Renavam, Chassi, Modelo, Ano, Secretaria, Odômetro, Tanque (L)
- Upload de documentos (CRLV, seguro)
- Histórico completo do veículo (viagens, manutenções, abastecimentos)

**RF-021: Gestão de Motoristas**
- CRUD completo de motoristas
- Campos: Nome, CPF, CNH (número, categoria, validade), Matrícula, Secretaria
- Upload de documentos (CNH frente/verso)
- Histórico: viagens realizadas, ocorrências
- Score de avaliação (preenchimento de relatórios, pontualidade)

**RF-022: Relatórios e Exportação**
- Relatórios pré-configurados:
  - Consumo por veículo/período
  - Viagens por motorista/período
  - Manutenções por categoria
  - Anomalias e flags de auditoria
- Filtros: período, secretaria, veículo, motorista
- Exportação: PDF (com gráficos), Excel (dados brutos), CSV

---

## 4. Requisitos Não-Funcionais

### 4.1 Performance

| Métrica | Requisito |
|---------|-----------|
| Tempo de carregamento (app) | < 3 segundos |
| Tempo de resposta (API) | < 500ms (P95) |
| Atualização do mapa | < 5 segundos |
| Sincronização offline | < 30 segundos após reconexão |

### 4.2 Segurança

- Dados em trânsito: TLS 1.3
- Dados em repouso: AES-256
- Senhas: bcrypt com salt
- Tokens: JWT com expiração de 8h
- Logs de auditoria: imutáveis, retidos por 5 anos
- LGPD: consentimento explícito, direito ao esquecimento

### 4.3 Disponibilidade

- Uptime: 99.5% (exceto manutenções programadas)
- Backup: diário, retenção de 30 dias
- Disaster Recovery: RTO < 4h, RPO < 1h

### 4.4 Compatibilidade

- **App Mobile:** Android 8+ e iOS 14+
- **Painel Desktop:** Chrome 90+, Firefox 90+, Edge 90+, Safari 15+
- **Responsivo:** Funciona em tablets (gestores em campo)

### 4.5 Acessibilidade

- WCAG 2.1 nível AA
- Contraste mínimo 4.5:1
- Navegação por teclado
- Suporte a leitores de tela

---

## 5. Arquitetura de UX

### 5.1 Princípios de Design

1. **Mobile-First para Motoristas:** Interfaces simplificadas, botões grandes, operações em poucos toques
2. **Dashboard-Centric para Gestores:** Informação crítica visível sem cliques, filtros poderosos
3. **Feedback Imediato:** Toda ação tem confirmação visual
4. **Tolerância a Erro:** Ações destrutivas pedem confirmação
5. **Funcionamento Offline:** Operações críticas funcionam sem internet

### 5.2 Paleta de Cores

```
Cor Primária (Escura):    HSL(188°, 49%, 12%) = #0F2B2F — Backgrounds, headers
Cor Secundária (Verde):   HSL(160°, 100%, 33%) = #00A86B — CTAs, sucesso, ações primárias
Cor Terciária (Menta):    HSL(161°, 33%, 60%) = #70C4A8 — Destaques, hover, secundários

Complementares:
- Branco: #FFFFFF — Fundos de cards
- Cinza Claro: #F5F7F9 — Backgrounds secundários
- Cinza Médio: #6B7280 — Texto secundário
- Vermelho: #DC2626 — Erros, alertas críticos
- Amarelo: #F59E0B — Warnings
```

### 5.3 Tipografia

- **Headlines:** Inter Bold, 24-32px
- **Body:** Inter Regular, 14-16px
- **Labels:** Inter Medium, 12px
- **App Mobile:** Tamanho mínimo 16px para acessibilidade

### 5.4 Fluxos Críticos

**Fluxo 1: Início de Jornada (Motorista)**
```
Login → Escanear QR → Checklist → Informar Destino → Iniciar Viagem
  │                       │
  ↓                       ↓
Biometria            Problema?
(opcional)           Foto + Descrição
                          │
                          ↓
                     Gerar Ordem
                     de Serviço
```

**Fluxo 2: Abastecimento (Motorista)**
```
Menu → Abastecimento → Preencher Dados → Foto Painel → Foto Nota → Validar → Confirmar
                            │                  │            │
                            ↓                  ↓            ↓
                       Teclado            Camera com    Verificação
                       numérico           guia visual   automática
```

**Fluxo 3: Monitoramento (Gestor)**
```
Login → Dashboard → Mapa Ao Vivo → Clique em Veículo → Detalhes + Histórico
            │              │
            ↓              ↓
         KPIs          Filtrar por
       atualizados     secretaria
```

---

## 6. Roadmap de Implementação

### Fase 1: MVP (3 meses)
- Setup de infraestrutura (AWS/GCP)
- App motorista: login, QR, checklist, viagens
- Painel gestor: dashboard básico, mapa, CRUD
- Integrações: API de mapas, autenticação

### Fase 2: Consolidação (2 meses)
- Módulo de abastecimento com fotos
- Módulo de manutenção
- Relatórios e exportação
- Notificações push

### Fase 3: Inteligência (3 meses)
- Analytics avançados
- Alertas preditivos
- Score de condução
- Geofencing

### Fase 4: Expansão (contínuo)
- Integrações com sistemas municipais
- App cidadão
- Machine Learning para manutenção

---

# PARTE 2: DOCUMENTAÇÃO TÉCNICA

---

## 7. Arquitetura do Sistema

### 7.1 Visão Geral

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                  │
├────────────────────────┬─────────────────────────────────────────┤
│   App Mobile (Flutter) │      Painel Web (React + TypeScript)    │
│   - Android            │      - Dashboard                        │
│   - iOS                │      - Gestão                           │
└───────────┬────────────┴───────────────────┬─────────────────────┘
            │                                 │
            ▼                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                 │
│                    (Kong / AWS API Gateway)                       │
│          - Rate Limiting  - Auth  - Logging                       │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + NestJS)                     │
├─────────────────┬─────────────────┬──────────────────────────────┤
│  Auth Service   │  Fleet Service  │   Reporting Service          │
│  - JWT          │  - Vehicles     │   - PDF Generation           │
│  - RBAC         │  - Drivers      │   - Excel Export             │
│                 │  - Trips        │   - Analytics                │
└────────┬────────┴────────┬────────┴─────────────┬────────────────┘
         │                 │                      │
         ▼                 ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                 │
├─────────────────┬─────────────────┬──────────────────────────────┤
│   PostgreSQL    │     Redis       │      S3 / MinIO              │
│   - Dados       │   - Cache       │   - Fotos                    │
│   - Audit Log   │   - Sessions    │   - Documentos               │
│                 │   - Real-time   │                              │
└─────────────────┴─────────────────┴──────────────────────────────┘
```

### 7.2 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Mobile | Flutter | Cross-platform, performance nativa, offline first |
| Web | React + TypeScript + TailwindCSS | Componentização, tipagem, produtividade |
| Backend | Node.js + NestJS | Performance, arquitetura modular, TypeScript |
| Database | PostgreSQL 15 | ACID, JSON support, extensões geográficas (PostGIS) |
| Cache | Redis 7 | Pub/sub para real-time, cache de sessões |
| Storage | AWS S3 / MinIO | Escalável, versionamento de arquivos |
| Maps | Google Maps Platform / OpenStreetMap | Geocoding, directions, distância |
| Push | Firebase Cloud Messaging | Cross-platform, confiável |
| Infra | Docker + Kubernetes | Containerização, orquestração |

### 7.3 Modelo de Dados (Entidades Principais)

```sql
-- Veículos
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate VARCHAR(10) UNIQUE NOT NULL,
    renavam VARCHAR(11),
    chassis VARCHAR(17),
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    fuel_type VARCHAR(20) NOT NULL, -- DIESEL, GASOLINE, ETHANOL, FLEX
    tank_capacity_liters DECIMAL(5,2) NOT NULL,
    current_odometer INTEGER NOT NULL DEFAULT 0,
    department_id UUID REFERENCES departments(id),
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, IN_USE, MAINTENANCE, INACTIVE
    qr_code_hash VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motoristas
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf VARCHAR(11) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(20), -- Matrícula
    cnh_number VARCHAR(11) NOT NULL,
    cnh_category VARCHAR(5) NOT NULL, -- A, B, C, D, E, AB, etc
    cnh_expiry_date DATE NOT NULL,
    department_id UUID REFERENCES departments(id),
    phone VARCHAR(20),
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    score DECIMAL(3,2) DEFAULT 5.00, -- 0.00 a 5.00
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Viagens
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    destination TEXT NOT NULL,
    estimated_distance_km DECIMAL(8,2),
    actual_distance_km DECIMAL(8,2),
    estimated_fuel_liters DECIMAL(6,2),
    start_odometer INTEGER NOT NULL,
    end_odometer INTEGER,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    start_location GEOGRAPHY(POINT, 4326),
    end_location GEOGRAPHY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED
    route_polyline TEXT, -- Encoded polyline
    has_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Abastecimentos
CREATE TABLE refuelings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    trip_id UUID REFERENCES trips(id), -- Pode ser NULL se fora de viagem
    liters DECIMAL(6,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    odometer INTEGER NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    supplier_name VARCHAR(100), -- Para postos não cadastrados
    photo_dashboard_url TEXT NOT NULL,
    photo_receipt_url TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    km_per_liter DECIMAL(5,2), -- Calculado
    has_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_type VARCHAR(50), -- ODOMETER_REGRESSION, EXCESSIVE_CONSUMPTION, LOCATION_MISMATCH
    validated_at TIMESTAMP,
    validated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklists
CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    trip_id UUID REFERENCES trips(id),
    type VARCHAR(20) NOT NULL, -- PRE_TRIP, POST_TRIP
    completed_at TIMESTAMP NOT NULL,
    has_issues BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES checklists(id) NOT NULL,
    item_template_id UUID REFERENCES checklist_templates(id) NOT NULL,
    status VARCHAR(20) NOT NULL, -- OK, PROBLEM, NOT_APPLICABLE
    notes TEXT,
    photo_url TEXT,
    is_critical BOOLEAN DEFAULT FALSE
);

-- Manutenções
CREATE TABLE maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    requested_by UUID REFERENCES drivers(id),
    type VARCHAR(30) NOT NULL, -- PREVENTIVE, CORRECTIVE, EMERGENCY
    category VARCHAR(30) NOT NULL, -- MECHANICAL, ELECTRICAL, TIRES, BODY
    description TEXT NOT NULL,
    urgency INTEGER DEFAULT 3 CHECK (urgency BETWEEN 1 AND 5),
    status VARCHAR(30) DEFAULT 'PENDING', 
    -- PENDING, APPROVED, REJECTED, IN_PROGRESS, AWAITING_PARTS, COMPLETED
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    service_provider VARCHAR(100),
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Posições (GPS)
CREATE TABLE position_logs (
    id BIGSERIAL PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    speed_kmh DECIMAL(5,2),
    heading DECIMAL(5,2), -- Direção em graus
    accuracy_meters DECIMAL(6,2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas geográficas e temporais
CREATE INDEX idx_position_logs_trip_time ON position_logs(trip_id, timestamp);
CREATE INDEX idx_position_logs_vehicle_time ON position_logs(vehicle_id, timestamp);
CREATE INDEX idx_position_logs_location ON position_logs USING GIST(location);
```

### 7.4 API Endpoints Principais

```yaml
# Autenticação
POST   /auth/login              # Login de motorista/gestor
POST   /auth/refresh            # Renovar token
POST   /auth/logout             # Invalidar sessão

# Veículos
GET    /vehicles                # Listar veículos (paginado, filtros)
GET    /vehicles/:id            # Detalhes do veículo
POST   /vehicles                # Cadastrar veículo
PUT    /vehicles/:id            # Atualizar veículo
DELETE /vehicles/:id            # Desativar veículo
GET    /vehicles/:id/history    # Histórico completo
POST   /vehicles/scan           # Identificar por QR Code

# Motoristas
GET    /drivers                 # Listar motoristas
GET    /drivers/:id             # Detalhes do motorista
POST   /drivers                 # Cadastrar motorista
PUT    /drivers/:id             # Atualizar motorista
GET    /drivers/:id/trips       # Viagens do motorista
GET    /drivers/:id/stats       # Estatísticas do motorista

# Viagens
GET    /trips                   # Listar viagens
GET    /trips/:id               # Detalhes da viagem
POST   /trips/start             # Iniciar viagem
PUT    /trips/:id/stop          # Parar viagem intermediária
PUT    /trips/:id/finish        # Finalizar viagem
GET    /trips/:id/route         # Rota percorrida

# Abastecimentos
GET    /refuelings              # Listar abastecimentos
POST   /refuelings              # Registrar abastecimento
GET    /refuelings/:id          # Detalhes
PUT    /refuelings/:id/validate # Validar (gestor)
GET    /refuelings/anomalies    # Listar anomalias

# Checklists
GET    /checklists/templates    # Templates de checklist
POST   /checklists              # Submeter checklist
GET    /checklists/:id          # Detalhes

# Manutenções
GET    /maintenances            # Listar manutenções
POST   /maintenances            # Solicitar manutenção
PUT    /maintenances/:id        # Atualizar status
PUT    /maintenances/:id/approve # Aprovar (gestor)

# Dashboard/Relatórios
GET    /dashboard/kpis          # KPIs do dashboard
GET    /dashboard/map           # Dados do mapa
GET    /reports/fuel            # Relatório de combustível
GET    /reports/trips           # Relatório de viagens
GET    /reports/export/:type    # Exportar (pdf, excel)

# Tracking (WebSocket)
WS     /tracking/live           # Posições em tempo real
```

### 7.5 Fluxo de Dados em Tempo Real

```
┌────────────────┐     GPS Data      ┌────────────────┐
│   App Mobile   │ ─────────────────▶│   API Gateway  │
│   (Flutter)    │   cada 30 seg     │                │
└────────────────┘                   └───────┬────────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │  Fleet Service │
                                    │  (Node.js)     │
                                    └───────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
           ┌────────────────┐      ┌────────────────┐       ┌────────────────┐
           │   PostgreSQL   │      │     Redis      │       │   WebSocket    │
           │  (position_    │      │   (Pub/Sub)    │       │   Server       │
           │   logs)        │      │                │       │                │
           └────────────────┘      └───────┬────────┘       └───────┬────────┘
                                           │                        │
                                           │     Subscribe          │
                                           └────────────────────────┘
                                                                     │
                                                                     ▼
                                                            ┌────────────────┐
                                                            │  Painel Web    │
                                                            │  (React)       │
                                                            │  Mapa ao Vivo  │
                                                            └────────────────┘
```

---

## 8. Especificações do App Mobile

### 8.1 Estrutura de Pastas (Flutter)

```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── routes.dart
│   └── theme.dart
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── storage/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── vehicle/
│   ├── trip/
│   ├── refueling/
│   ├── maintenance/
│   └── profile/
└── shared/
    ├── widgets/
    └── extensions/
```

### 8.2 Sincronização Offline

```dart
// Estratégia de sincronização
class SyncManager {
  final LocalDatabase _localDb;
  final ApiClient _api;
  final ConnectivityService _connectivity;

  Future<void> sync() async {
    if (!await _connectivity.isOnline) return;
    
    // 1. Enviar dados pendentes (created offline)
    final pendingTrips = await _localDb.getPendingTrips();
    for (final trip in pendingTrips) {
      try {
        await _api.trips.create(trip);
        await _localDb.markAsSynced(trip.id);
      } catch (e) {
        // Manter para próxima tentativa
      }
    }
    
    // 2. Buscar atualizações (veículos, templates)
    final lastSync = await _localDb.getLastSyncTime();
    final updates = await _api.sync.getUpdates(since: lastSync);
    await _localDb.applyUpdates(updates);
  }
}
```

### 8.3 Captura de Fotos com Validação

```dart
class PhotoCaptureWidget extends StatelessWidget {
  Future<File?> capturePhoto(PhotoType type) async {
    final camera = await ImagePicker().pickImage(
      source: ImageSource.camera,
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 85,
    );
    
    if (camera == null) return null;
    
    // Obter localização
    final position = await Geolocator.getCurrentPosition();
    
    // Adicionar marca d'água
    final watermarked = await addWatermark(
      imagePath: camera.path,
      text: _buildWatermarkText(type, position),
    );
    
    // Validar GPS
    if (position.accuracy > 50) {
      throw PhotoValidationError('GPS impreciso. Mova-se para área aberta.');
    }
    
    return watermarked;
  }
  
  String _buildWatermarkText(PhotoType type, Position pos) {
    final now = DateTime.now();
    return '''
SGF 2026 | ${type.label}
${DateFormat('dd/MM/yyyy HH:mm').format(now)}
GPS: ${pos.latitude.toStringAsFixed(6)}, ${pos.longitude.toStringAsFixed(6)}
    ''';
  }
}
```

---

## 9. Especificações do Painel Web

### 9.1 Estrutura de Pastas (React)

```
src/
├── main.tsx
├── App.tsx
├── assets/
├── components/
│   ├── ui/           # Componentes base (Button, Input, Card)
│   ├── layout/       # Header, Sidebar, Footer
│   ├── dashboard/    # KPICard, Charts
│   ├── map/          # MapContainer, VehiclePin
│   └── forms/        # VehicleForm, DriverForm
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── vehicles/
│   ├── drivers/
│   ├── trips/
│   ├── refuelings/
│   ├── maintenances/
│   └── reports/
├── hooks/
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── validations.ts
├── stores/           # Zustand stores
└── types/
```

### 9.2 Tema e Cores (TailwindCSS)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'sgf': {
          'dark': 'hsl(188, 49%, 12%)',      // #0F2B2F - Primary dark
          'primary': 'hsl(160, 100%, 33%)',  // #00A86B - Primary green
          'light': 'hsl(161, 33%, 60%)',     // #70C4A8 - Light accent
          'surface': '#F5F7F9',
          'text': {
            'primary': '#1F2937',
            'secondary': '#6B7280',
          }
        },
        'status': {
          'moving': '#22C55E',    // Verde - Em movimento
          'idle': '#3B82F6',      // Azul - Parado/ligado
          'stopped': '#9CA3AF',   // Cinza - Desligado
          'alert': '#EF4444',     // Vermelho - Alerta
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### 9.3 Componente de Mapa com Rastreamento

```tsx
// components/map/TrackingMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useWebSocket } from '@/hooks/useWebSocket';

interface VehiclePosition {
  vehicleId: string;
  plate: string;
  lat: number;
  lng: number;
  speed: number;
  status: 'moving' | 'idle' | 'stopped' | 'alert';
  driver: string;
  lastUpdate: Date;
}

export function TrackingMap() {
  const [vehicles, setVehicles] = useState<Map<string, VehiclePosition>>(new Map());
  
  const { subscribe, isConnected } = useWebSocket('/tracking/live');
  
  useEffect(() => {
    const unsubscribe = subscribe('position_update', (data: VehiclePosition) => {
      setVehicles(prev => new Map(prev).set(data.vehicleId, data));
    });
    
    return unsubscribe;
  }, [subscribe]);
  
  const getMarkerIcon = (status: VehiclePosition['status']) => {
    const colors = {
      moving: '#22C55E',
      idle: '#3B82F6',
      stopped: '#9CA3AF',
      alert: '#EF4444',
    };
    return createCustomIcon(colors[status]);
  };
  
  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      {/* Status de conexão */}
      <div className="absolute top-4 right-4 z-[1000]">
        <span className={`px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '● Ao vivo' : '○ Reconectando...'}
        </span>
      </div>
      
      <MapContainer
        center={[-23.5505, -46.6333]} // São Paulo default
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {Array.from(vehicles.values()).map(vehicle => (
          <Marker
            key={vehicle.vehicleId}
            position={[vehicle.lat, vehicle.lng]}
            icon={getMarkerIcon(vehicle.status)}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-lg">{vehicle.plate}</p>
                <p className="text-gray-600">{vehicle.driver}</p>
                <p className="text-sm">
                  Velocidade: {vehicle.speed.toFixed(0)} km/h
                </p>
                <p className="text-xs text-gray-400">
                  Atualizado: {formatDistanceToNow(vehicle.lastUpdate)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

---

## 10. Integrações Externas

### 10.1 Google Maps Platform

```typescript
// Serviços utilizados
const GOOGLE_MAPS_SERVICES = {
  // Geocoding: Converter endereço em coordenadas
  geocode: async (address: string) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    );
    return response.json();
  },
  
  // Directions: Calcular rota e distância
  directions: async (origin: LatLng, destination: LatLng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${API_KEY}`
    );
    return response.json();
  },
  
  // Distance Matrix: Distância e tempo estimado
  distanceMatrix: async (origins: LatLng[], destinations: LatLng[]) => {
    // ...
  }
};
```

### 10.2 Firebase Cloud Messaging

```typescript
// Tipos de notificação
enum NotificationType {
  MAINTENANCE_APPROVED = 'maintenance_approved',
  MAINTENANCE_REQUIRED = 'maintenance_required',
  CNH_EXPIRING = 'cnh_expiring',
  ANOMALY_DETECTED = 'anomaly_detected',
  VEHICLE_STOPPED = 'vehicle_stopped',
  GEOFENCE_VIOLATION = 'geofence_violation',
}

// Envio de notificação
async function sendPushNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, string>
) {
  const token = await getUserFCMToken(userId);
  
  await admin.messaging().send({
    token,
    notification: {
      title: getNotificationTitle(type),
      body: getNotificationBody(type, data),
    },
    data: {
      type,
      ...data,
      click_action: getClickAction(type),
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'sgf_alerts',
        color: '#00A86B',
      },
    },
    apns: {
      payload: {
        aps: {
          badge: 1,
          sound: 'default',
        },
      },
    },
  });
}
```

---

## 11. Segurança e Auditoria

### 11.1 Controle de Acesso (RBAC)

```typescript
// Definição de papéis e permissões
const ROLES = {
  ADMIN: {
    permissions: ['*'], // Tudo
  },
  MANAGER: {
    permissions: [
      'vehicles:read', 'vehicles:write',
      'drivers:read', 'drivers:write',
      'trips:read',
      'refuelings:read', 'refuelings:validate',
      'maintenances:read', 'maintenances:approve',
      'reports:read', 'reports:export',
      'dashboard:read',
    ],
  },
  VIEWER: {
    permissions: [
      'vehicles:read',
      'drivers:read',
      'trips:read',
      'refuelings:read',
      'maintenances:read',
      'reports:read',
      'dashboard:read',
    ],
  },
  DRIVER: {
    permissions: [
      'vehicles:scan',
      'trips:create', 'trips:read:own',
      'refuelings:create', 'refuelings:read:own',
      'maintenances:create', 'maintenances:read:own',
      'checklists:create',
      'profile:read', 'profile:write',
    ],
  },
};
```

### 11.2 Log de Auditoria

```sql
-- Tabela de auditoria imutável
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    user_type VARCHAR(20) NOT NULL, -- DRIVER, MANAGER, ADMIN, SYSTEM
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(64)
);

-- Índices para consultas de auditoria
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Função para impedir deleção/alteração
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```

---

## 12. Configurações e Parâmetros

### 12.1 Parâmetros Configuráveis pelo Gestor

```typescript
interface SystemConfig {
  // Manutenção preventiva
  maintenance: {
    oilChangeKm: number;         // Default: 10000
    oilChangeMonths: number;     // Default: 6
    tireRotationKm: number;      // Default: 10000
    generalRevisionKm: number;   // Default: 50000
    alertDaysBefore: number;     // Default: 7
  };
  
  // Documentos
  documents: {
    cnhAlertDaysBefore: number;  // Default: 30
    crlvAlertDaysBefore: number; // Default: 30
  };
  
  // Viagens
  trips: {
    gpsIntervalSeconds: number;  // Default: 30
    maxIdleMinutes: number;      // Default: 30
    deviationAlertPercent: number; // Default: 20
  };
  
  // Abastecimento
  refueling: {
    requirePhotos: boolean;      // Default: true
    requireGps: boolean;         // Default: true
    consumptionTolerancePercent: number; // Default: 30
  };
  
  // Checklist
  checklist: {
    required: boolean;           // Default: true
    blockOnCriticalIssue: boolean; // Default: true
  };
}
```

---

## 13. Métricas e Monitoramento

### 13.1 KPIs do Sistema

```typescript
interface DashboardKPIs {
  // Frota
  fleet: {
    totalVehicles: number;
    activeNow: number;
    inMaintenance: number;
    idle7Days: number;
    availabilityRate: number; // %
  };
  
  // Combustível
  fuel: {
    totalLitersMonth: number;
    totalCostMonth: number;
    avgKmPerLiter: number;
    anomalyCount: number;
  };
  
  // Viagens
  trips: {
    totalTripsMonth: number;
    totalKmMonth: number;
    avgTripsPerDay: number;
    avgTripDuration: number; // minutos
  };
  
  // Manutenção
  maintenance: {
    pendingRequests: number;
    inProgress: number;
    avgResolutionDays: number;
    preventiveCompliance: number; // %
  };
  
  // Motoristas
  drivers: {
    totalActive: number;
    cnhExpiringSoon: number;
    avgScore: number;
  };
}
```

### 13.2 Alertas Automáticos

| Tipo de Alerta | Condição | Ação |
|----------------|----------|------|
| CNH Vencendo | 30 dias antes do vencimento | Notificação para motorista e gestor |
| Manutenção Preventiva | Km ou tempo atingido | Gerar ordem de serviço automática |
| Consumo Anômalo | Km/L fora da faixa ±30% | Flag no registro + notificação |
| Veículo Parado | Motor ligado > 30 min parado | Notificação para gestor |
| Fora de Rota | Desvio > 20% do trajeto | Notificação em tempo real |
| GPS Inativo | Sem sinal > 5 min durante viagem | Alerta no app + notificação |

---

## 14. Glossário

| Termo | Definição |
|-------|-----------|
| **Checklist** | Lista de verificação de itens do veículo antes da viagem |
| **Flag de Auditoria** | Marcação automática em registros suspeitos para análise |
| **Geofencing** | Cercamento virtual para alertar saída de área permitida |
| **KPI** | Key Performance Indicator - Indicador-chave de performance |
| **Odômetro** | Contador de quilometragem do veículo |
| **PRD** | Product Requirements Document - Documento de Requisitos do Produto |
| **QR Code** | Código bidimensional para identificação rápida do veículo |
| **RBAC** | Role-Based Access Control - Controle de acesso baseado em papéis |
| **RTO** | Recovery Time Objective - Tempo máximo para restaurar o sistema |
| **RPO** | Recovery Point Objective - Perda máxima de dados aceitável |
| **Vinculação** | Processo de associar motorista a um veículo específico |

---

## 15. Anexos

### 15.1 Exemplos de Telas (Descrição)

**App Mobile - Tela Inicial**
- Header escuro (HSL 188°) com logo e nome do motorista
- Card grande para "Escanear QR Code" em verde (HSL 160°)
- Lista de atalhos: Histórico, Abastecimento, Manutenção
- Bottom navigation: Home, Viagens, Perfil

**App Mobile - Durante Viagem**
- Mapa ocupando 60% da tela
- Card inferior com: velocidade, tempo, km rodados
- Botões: Parada Intermediária, Finalizar Viagem
- Indicador de GPS ativo

**Painel Web - Dashboard**
- Sidebar escura (HSL 188°) com menu
- Grid de 4 KPI cards no topo
- Gráfico de gastos (linha) ocupando 50% da largura
- Gráfico de secretarias (pizza) ao lado
- Tabela de atividades recentes abaixo

**Painel Web - Mapa**
- Mapa fullscreen com sidebar retrátil
- Filtros por secretaria no topo
- Pins coloridos por status
- Painel lateral ao clicar em veículo

---

**Documento preparado para:** Prefeitura Municipal - Setor de Obras  
**Confidencialidade:** Interno
