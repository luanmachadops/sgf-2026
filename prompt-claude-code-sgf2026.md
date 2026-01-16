# Prompt para Claude Code CLI — SGF 2026

Cole este prompt no Claude Code CLI para gerar o projeto completo.

---

## PROMPT PRINCIPAL

```
Você é um desenvolvedor full-stack senior. Crie o sistema SGF 2026 (Sistema de Gestão de Frotas Municipal) completo seguindo EXATAMENTE estas especificações:

---

## VISÃO GERAL

Sistema de gestão de frotas para prefeitura com:
1. **App Mobile (Flutter)** — Para motoristas
2. **Painel Web (React + TypeScript)** — Para gestores
3. **Backend API (Node.js + NestJS)** — REST API
4. **Banco de Dados (PostgreSQL)** — Com PostGIS

---

## PALETA DE CORES (OBRIGATÓRIO)

```
Primary Dark:   #0F2B2F (HSL 188° 49% 12%) — Headers, sidebar, backgrounds escuros
Primary Green:  #00A86B (HSL 160° 100% 33%) — Botões, CTAs, sucesso
Light Accent:   #70C4A8 (HSL 161° 33% 60%) — Hovers, destaques secundários
Surface:        #F5F7F9 — Backgrounds claros
Text Primary:   #1F2937
Text Secondary: #6B7280
Error:          #DC2626
Warning:        #F59E0B
```

---

## ESTRUTURA DO PROJETO

```
sgf-2026/
├── mobile/          # Flutter app
├── web/             # React + Vite + TypeScript
├── backend/         # NestJS API
├── database/        # Migrations e seeds
└── docker-compose.yml
```

---

## 1. BACKEND (NestJS)

### Setup inicial:
- NestJS com TypeScript
- TypeORM + PostgreSQL
- JWT Authentication
- Class-validator para DTOs
- Swagger para documentação

### Entidades principais:

```typescript
// Vehicle
- id: UUID
- plate: string (unique)
- brand: string
- model: string
- year: number
- fuelType: enum (DIESEL, GASOLINE, ETHANOL, FLEX)
- tankCapacity: number
- currentOdometer: number
- departmentId: UUID
- status: enum (AVAILABLE, IN_USE, MAINTENANCE, INACTIVE)
- qrCodeHash: string (unique)
- createdAt, updatedAt

// Driver
- id: UUID
- cpf: string (unique, 11 digits)
- name: string
- registrationNumber: string
- cnhNumber: string
- cnhCategory: string
- cnhExpiryDate: Date
- departmentId: UUID
- phone: string
- email: string
- passwordHash: string
- score: decimal (0-5)
- status: enum (ACTIVE, INACTIVE, SUSPENDED)
- createdAt, updatedAt

// Trip
- id: UUID
- vehicleId: UUID (FK)
- driverId: UUID (FK)
- destination: string
- estimatedDistanceKm: decimal
- actualDistanceKm: decimal
- startOdometer: number
- endOdometer: number
- startTime: timestamp
- endTime: timestamp
- startLat, startLng: decimal
- endLat, endLng: decimal
- status: enum (IN_PROGRESS, COMPLETED, CANCELLED)
- hasAnomaly: boolean
- createdAt

// Refueling
- id: UUID
- vehicleId: UUID (FK)
- driverId: UUID (FK)
- tripId: UUID (FK, nullable)
- liters: decimal
- totalCost: decimal
- odometer: number
- fuelType: string
- supplierName: string
- photoDashboardUrl: string
- photoReceiptUrl: string
- lat, lng: decimal
- kmPerLiter: decimal (calculated)
- hasAnomaly: boolean
- anomalyType: string (nullable)
- validatedAt: timestamp (nullable)
- validatedBy: UUID (nullable)
- createdAt

// Maintenance
- id: UUID
- vehicleId: UUID (FK)
- requestedBy: UUID (FK Driver)
- type: enum (PREVENTIVE, CORRECTIVE, EMERGENCY)
- category: enum (MECHANICAL, ELECTRICAL, TIRES, BODY)
- description: text
- urgency: number (1-5)
- status: enum (PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED)
- estimatedCost: decimal
- actualCost: decimal
- approvedBy: UUID (nullable)
- approvedAt: timestamp (nullable)
- createdAt, updatedAt

// Checklist
- id: UUID
- vehicleId: UUID (FK)
- driverId: UUID (FK)
- tripId: UUID (FK, nullable)
- type: enum (PRE_TRIP, POST_TRIP)
- hasIssues: boolean
- completedAt: timestamp
- items: JSON array

// Department
- id: UUID
- name: string
- code: string
- createdAt

// User (para painel web)
- id: UUID
- email: string (unique)
- passwordHash: string
- name: string
- role: enum (ADMIN, MANAGER, VIEWER)
- departmentId: UUID (nullable)
- createdAt, updatedAt
```

### Endpoints da API:

```
POST   /auth/login
POST   /auth/refresh
POST   /auth/driver/login

GET    /vehicles
GET    /vehicles/:id
POST   /vehicles
PUT    /vehicles/:id
DELETE /vehicles/:id
POST   /vehicles/scan (QR Code lookup)
GET    /vehicles/:id/history

GET    /drivers
GET    /drivers/:id
POST   /drivers
PUT    /drivers/:id
GET    /drivers/:id/trips
GET    /drivers/:id/stats

POST   /trips/start
PUT    /trips/:id/finish
GET    /trips
GET    /trips/:id
GET    /trips/:id/route

POST   /refuelings
GET    /refuelings
GET    /refuelings/:id
PUT    /refuelings/:id/validate
GET    /refuelings/anomalies

POST   /maintenances
GET    /maintenances
PUT    /maintenances/:id
PUT    /maintenances/:id/approve

POST   /checklists
GET    /checklists/templates

GET    /dashboard/kpis
GET    /dashboard/map-data

GET    /reports/fuel
GET    /reports/trips
GET    /reports/export/:type
```

### Validações de negócio:
- Abastecimento: odômetro não pode regredir, km/L deve estar na faixa ±30% do esperado
- Viagem: desvio > 20% da distância estimada gera flag
- CNH: alertar 30 dias antes do vencimento
- Checklist: itens críticos bloqueiam viagem

---

## 2. PAINEL WEB (React)

### Setup:
- Vite + React 18 + TypeScript
- TailwindCSS (com cores customizadas)
- React Router v6
- TanStack Query (React Query)
- Zustand para state management
- Recharts para gráficos
- React-Leaflet para mapas
- Lucide React para ícones
- React Hook Form + Zod

### Estrutura de pastas:

```
src/
├── components/
│   ├── ui/           # Button, Input, Card, Modal, Table
│   ├── layout/       # Sidebar, Header, PageContainer
│   ├── dashboard/    # KPICard, Charts
│   └── map/          # TrackingMap, VehicleMarker
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
│   └── utils.ts
├── stores/
└── types/
```

### Telas a implementar:

**Layout Principal:**
- Sidebar fixa à esquerda (240px) com cor #0F2B2F
- Header com logo, busca global, notificações, perfil
- Área de conteúdo com background #F5F7F9

**Menu da Sidebar:**
```
📊 Dashboard
🗺️ Mapa
───────────
🚗 Veículos
👤 Motoristas
───────────
🛣️ Viagens
⛽ Abastecimentos
🔧 Manutenções
───────────
📈 Relatórios
⚙️ Configurações
```

**Tela: Dashboard**
- 4 KPI Cards no topo (Veículos ativos, Gasto combustível, Em manutenção, Km rodados)
- Gráfico de linha: Evolução de gastos (6 meses)
- Gráfico de pizza: Distribuição por secretaria
- Tabela: Atividades recentes (últimas 10)
- Lista: Alertas ativos

**Tela: Mapa**
- Mapa fullscreen com OpenStreetMap
- Markers coloridos por status (verde=movimento, azul=parado, cinza=desligado, vermelho=alerta)
- Sidebar retrátil com lista de veículos
- Popup ao clicar: placa, motorista, velocidade, destino
- Filtros: secretaria, status

**Tela: Veículos**
- Tabela com: Placa, Modelo, Ano, Secretaria, Odômetro, Status, Ações
- Filtros: busca, secretaria, status
- Modal para criar/editar veículo
- Página de detalhes com abas: Histórico, Viagens, Abastecimentos, Manutenções

**Tela: Motoristas**
- Tabela com: Nome, CPF, CNH, Validade, Secretaria, Score, Status
- Badge de alerta para CNH vencendo/vencida
- Modal para criar/editar
- Página de detalhes com estatísticas

**Tela: Viagens**
- Tabela com: Data, Motorista, Veículo, Destino, Km, Duração, Status
- Filtros: período, veículo, motorista, anomalias
- Detalhes: mapa com rota, timeline de eventos

**Tela: Abastecimentos**
- Cards resumo: Total R$, Total Litros, Média km/L
- Tabela com: Data, Veículo, Motorista, Litros, Valor, km/L, Status
- Filtro para anomalias e pendentes
- Modal de validação com visualização das fotos

**Tela: Manutenções**
- Kanban com colunas: Pendente, Aprovada, Em Andamento, Concluída
- Cards com: Veículo, Categoria, Urgência, Data
- Modal de detalhes com ações de aprovação

**Tela: Relatórios**
- Grid de cards com tipos de relatório
- Modal de configuração: período, filtros, formato (PDF/Excel)
- Preview e download

**Tela: Configurações**
- Formulário com parâmetros do sistema
- Gestão de usuários (CRUD)

### Componentes UI base:

```tsx
// Button com variantes: primary, secondary, danger, ghost
// Input com estados: default, focus, error, disabled
// Card com sombra e hover
// Table com sorting, pagination
// Modal com overlay
// Badge para status
// Toast para notificações
```

---

## 3. APP MOBILE (Flutter)

### Setup:
- Flutter 3.x
- Provider ou Riverpod para state
- Dio para HTTP
- Hive para storage local
- Google Maps Flutter
- Image Picker + Camera
- Geolocator
- QR Code Scanner

### Estrutura:

```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── routes.dart
│   └── theme.dart
├── core/
│   ├── constants/
│   ├── network/
│   └── storage/
├── features/
│   ├── auth/
│   ├── home/
│   ├── vehicle/
│   ├── trip/
│   ├── refueling/
│   ├── maintenance/
│   └── profile/
└── shared/
    └── widgets/
```

### Telas a implementar:

**Bottom Navigation (4 tabs):**
```
🏠 Home | 🚗 Viagens | ⛽ Serviços | 👤 Perfil
```

**Tela: Login**
- Campo CPF com máscara
- Campo Senha
- Checkbox "Lembrar-me"
- Botão "ENTRAR" (verde #00A86B)

**Tela: Home**
- Header escuro (#0F2B2F) com logo e nome
- Card principal:
  - Sem veículo: Botão grande "VINCULAR VEÍCULO"
  - Com veículo: Info do veículo + "INICIAR VIAGEM"
- Grid 2x2 de atalhos: Abastecimento, Manutenção, Checklist, Histórico
- Lista de alertas (se houver)

**Tela: Scanner QR**
- Câmera fullscreen com guia
- Fallback: "Buscar manualmente" → lista filtrável

**Tela: Checklist**
- Lista de itens agrupados por categoria
- Cada item: [OK] [PROBLEMA] [N/A]
- Se problema: campo texto + botão foto
- Botão "CONTINUAR" no final

**Tela: Definir Destino**
- Campo de destino com autocomplete
- Lista de favoritos
- Preview do mapa com rota
- Info: distância e tempo estimados
- Botão "INICIAR VIAGEM"

**Tela: Viagem em Andamento**
- Mapa ocupando 60% da tela
- Card inferior com: velocidade, tempo, km
- FAB: "PARADA" → modal de tipo de parada
- Botão: "FINALIZAR VIAGEM"

**Tela: Resumo da Viagem**
- Ícone de sucesso
- Dados: destino, km, tempo, consumo
- Campo para confirmar odômetro
- Botões: "NOVA VIAGEM" / "VOLTAR"

**Tela: Abastecimento (3 etapas)**
1. Dados: odômetro, litros, valor, tipo, posto
2. Foto do painel (com guia visual)
3. Foto da nota (com guia visual)
4. Confirmação com resumo

**Tela: Manutenção**
- Dropdown: categoria
- Campo: descrição
- Slider: urgência (1-5)
- Botão: adicionar fotos (até 5)
- Botão: "ENVIAR SOLICITAÇÃO"

**Tela: Histórico de Viagens**
- Filtros: período, veículo
- Lista de cards com: data, destino, km, duração
- Clique: tela de detalhes

**Tela: Perfil**
- Avatar + nome + matrícula
- Seção: Dados pessoais
- Seção: CNH (com alerta de validade)
- Seção: Estatísticas (viagens, km, score)
- Botão: "SAIR"

### Theme (theme.dart):

```dart
// Cores
static const primaryDark = Color(0xFF0F2B2F);
static const primaryGreen = Color(0xFF00A86B);
static const lightAccent = Color(0xFF70C4A8);
static const surface = Color(0xFFF5F7F9);
static const textPrimary = Color(0xFF1F2937);
static const textSecondary = Color(0xFF6B7280);
static const error = Color(0xFFDC2626);
static const warning = Color(0xFFF59E0B);

// Fonte
fontFamily: 'Inter'

// Botão primário
ElevatedButton: backgroundColor primaryGreen, foregroundColor white

// AppBar
backgroundColor: primaryDark
```

---

## 4. DOCKER COMPOSE

```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: sgf2026
      POSTGRES_USER: sgf
      POSTGRES_PASSWORD: sgf2026pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://sgf:sgf2026pass@postgres:5432/sgf2026
      JWT_SECRET: your-super-secret-key
    depends_on:
      - postgres

  web:
    build: ./web
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## INSTRUÇÕES DE EXECUÇÃO

1. Comece pelo backend: crie o projeto NestJS, configure TypeORM, implemente todas as entidades e endpoints
2. Depois o web: crie o projeto React, configure Tailwind com as cores, implemente todas as telas
3. Por último o mobile: crie o projeto Flutter, configure o tema, implemente as telas
4. Gere seeds com dados fictícios para testar

Gere TODOS os arquivos necessários. Seja completo e detalhado em cada implementação.

Comece agora criando a estrutura de pastas e os primeiros arquivos do backend.
```

---

## COMANDOS SUGERIDOS PARA EXECUÇÃO

Após colar o prompt principal, você pode usar estes comandos de follow-up:

```
# Para continuar o backend
Continue implementando os módulos de vehicles, drivers e trips do backend.

# Para gerar o painel web
Agora crie o projeto web React completo com todas as telas especificadas.

# Para gerar o app mobile
Agora crie o app Flutter completo com todas as telas especificadas.

# Para ajustes específicos
Implemente a tela de Dashboard do painel web com os gráficos usando Recharts.

# Para gerar seeds
Crie um arquivo de seed com 10 veículos, 5 motoristas, 20 viagens e 15 abastecimentos fictícios.
```

---

## DICAS DE USO

1. **Divida em sessões**: O projeto é grande, peça por partes (backend primeiro, depois web, depois mobile)

2. **Use o contexto**: Se ele "esquecer" algo, relembre: "Lembre-se das cores: #0F2B2F, #00A86B, #70C4A8"

3. **Peça revisões**: "Revise o código do módulo X e adicione tratamento de erros"

4. **Teste incrementalmente**: Peça para rodar e testar cada parte antes de avançar

5. **Salve checkpoints**: Commite o código funcionando antes de pedir grandes mudanças
