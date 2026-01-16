# SGF 2026 - Backend API

Sistema de Gestão de Frotas Municipal - Backend desenvolvido com NestJS, TypeORM e PostgreSQL (Supabase).

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ e npm
- Acesso ao projeto Supabase (ghvbydtytdxdgviuunvm)

### Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
- `DATABASE_URL`: String de conexão do Supabase
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anon do Supabase
- `JWT_SECRET`: Segredo para tokens JWT

3. **Executar em modo desenvolvimento:**
```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000/api`

📚 Documentação Swagger: `http://localhost:3000/api/docs`

## 📂 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/              # Configurações (database, etc)
│   ├── departments/         # Módulo de Secretarias
│   ├── vehicles/            # Módulo de Veículos ✅
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── vehicle.entity.ts
│   │   ├── vehicles.module.ts
│   │   ├── vehicles.controller.ts
│   │   └── vehicles.service.ts
│   ├── drivers/             # Motoristas (entidade criada)
│   ├── trips/               # Viagens (entidade criada)
│   ├── refuelings/          # Abastecimentos (entidade criada)
│   ├── maintenances/        # Manutenções (entidade criada)
│   ├── checklists/          # Checklists (entidade criada)
│   ├── users/               # Usuários do painel (entidade criada)
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

## ✅ Progresso da Implementação

### Concluído
- ✅ Configuração inicial do projeto (package.json, tsconfig, nest-cli)
- ✅ Configuração do TypeORM com Supabase
- ✅ Todas as 8 entidades criadas e mapeadas
- ✅ Módulo completo de Veículos (VehiclesModule)
  - Controller com endpoints REST
  - Service com lógica de negócio
  - DTOs com validações
  - Documentação Swagger
- ✅ Banco de dados Supabase configurado
  - 8 tabelas criadas
  - Dados de seed populados

### Próximos Passos (TODO)
- [ ] Implementar módulos restantes (Drivers, Trips, Refuelings, etc)
- [ ] Implementar autenticação JWT
- [ ] Implementar guards de autorização
- [ ] Implementar módulo de Dashboard com KPIs
- [ ] Implementar validações de negócio (anomalias, etc)
- [ ] Testes unitários e e2e

## 🔗 Endpoints da API

### Veículos (`/api/vehicles`)
- `GET /api/vehicles` - Listar todos os veículos
- `GET /api/vehicles/:id` - Buscar veículo por ID
- `GET /api/vehicles/plate/:plate` - Buscar por placa
- `POST /api/vehicles/scan` - Buscar por QR Code
- `POST /api/vehicles` - Criar novo veículo
- `PUT /api/vehicles/:id` - Atualizar veículo
- `PUT /api/vehicles/:id/status` - Atualizar status
- `PUT /api/vehicles/:id/odometer` - Atualizar odômetro
- `DELETE /api/vehicles/:id` - Remover veículo

## 🗄️ Banco de Dados

O banco está hospedado no Supabase (PostgreSQL 17.6) com as seguintes tabelas:

- `departments` - Secretarias municipais
- `vehicles` - Veículos da frota
- `drivers` - Motoristas autorizados
- `trips` - Registro de viagens
- `refuelings` - Registro de abastecimentos
- `maintenances` - Solicitações de manutenção
- `checklists` - Inspeções pré/pós viagem
- `users` - Usuários do painel web

## 🛠️ Scripts Disponíveis

```bash
npm run start:dev     # Desenvolvimento com hot-reload
npm run start:prod    # Produção
npm run build         # Build para produção
npm run lint          # Lint do código
npm run test          # Testes unitários
npm run test:e2e      # Testes end-to-end
```

## 📖 Documentação

Acesse a documentação interativa Swagger em:
`http://localhost:3000/api/docs`

## 🔐 Segurança

- Validação de todos os inputs com class-validator
- TypeORM com proteção contra SQL Injection
- CORS configurado
- JWT para autenticação (a implementar)

## 📝 Notas de Desenvolvimento

### Como Replicar o Módulo de Veículos para Outros Módulos

O módulo `VehiclesModule` serve como template. Para criar um novo módulo:

1. Copie a estrutura do diretório `vehicles/`
2. Adapte a entidade (já criada)
3. Crie os DTOs necessários
4. Crie o service com a lógica de negócio
5. Crie o controller com os endpoints
6. Crie o module e registre no App Module
7. Adicione tags e documentação Swagger

### Padrão de Código
- Use DTOs para validação
- Use decoradores do Swagger para documentação
- Use TypeScript strict mode
- Siga princípios SOLID
