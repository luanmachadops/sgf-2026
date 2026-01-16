# SGF 2026 - Sistema de Gestão de Frotas Municipal

Sistema completo de gestão de frotas para prefeitura com backend NestJS, painel web React e aplicativo mobile Flutter.

## 📦 Estrutura do Projeto

```
sgf-2026/
├── backend/          # API NestJS + TypeORM + Supabase
├── web/              # Painel React + Vite + TypeScript
├── mobile/           # App Flutter
├── database/         # Migrações SQL e seeds
└── docker-compose.yml
```

## 🚀 Início Rápido

### Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis no .env
npm run start:dev
```

API:  `http://localhost:3000/api`
Docs: `http://localhost:3000/api/docs`

### Web (React) - EM DESENVOLVIMENTO

```bash
cd web
npm install
npm run dev
```

### Mobile (Flutter) - EM DESENVOLVIMENTO

```bash
cd mobile
flutter pub get
flutter run
```

## 📊 Status da Implementação

### ✅ Backend (70% concluído)
- ✅ Configuração NestJS + TypeORM
- ✅ Conexão com Supabase
- ✅ Todas as entidades criadas
- ✅ Módulo de Veículos completo
- ⏳ Módulos restantes (Drivers, Trips, etc)
- ⏳ Autenticação JWT

### ⏳ Banco de Dados (100% concluído)
- ✅ 8 tabelas criadas no Supabase
- ✅ Migrações SQL
- ✅ Dados de seed

### ⏳ Web (0% - Não iniciado)
### ⏳ Mobile (0% - Não iniciado)

## 🗄️ Banco de Dados

**Projeto Supabase:** AppGaragem (`ghvbydtytdxdgviuunvm`)  
**Região:** sa-east-1  
**PostgreSQL:** 17.6 com PostGIS

### Tabelas
- departments (5 registros)
- vehicles (8 registros)
- drivers (6 registros)
- trips, refuelings, maintenances, checklists, users

## 📚 Documentação

- [Backend README](./backend/README.md) - Guia completo do backend
- [Documentação Original](./sgf-2026-documentacao.md) - Especificação completa do projeto

## 🎨 Paleta de Cores

- Primary Dark: `#0F2B2F` (HSL 188° 49% 12%)
- Primary Green: `#00A86B` (HSL 160° 100% 33%)
- Light Accent: `#70C4A8` (HSL 161° 33% 60%)
- Surface: `#F5F7F9`
- Text Primary: `#1F2937`
- Text Secondary: `#6B7280`

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard/project/ghvbydtytdxdgviuunvm)
- Backend Swagger: http://localhost:3000/api/docs

## 👥 Contribuindo

Este é um projeto municipal. Consulte as especificações completas em `sgf-2026-documentacao.md`.

## 📝 Próximos Passos

1. [ ] Completar módulos restantes do backend
2. [ ] Implementar autenticação
3. [ ] Iniciar desenvolvimento do painel web React
4. [ ] Iniciar desenvolvimento do app mobile Flutter
5. [ ] Testes end-to-end integrados
