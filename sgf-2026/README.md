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

### ✅ Banco de Dados (100% concluído)
- ✅ Dependências completas (tabelas, triggers, functions)
- ✅ Migrações SQL e seeds
- ✅ Row Level Security (RLS) configurado

### 🚧 Web (React) - ~70% concluído
- ✅ Configuração React + Vite + TypeScript (com Tailwind e Lucide)
- ✅ Integração direta com Supabase
- ✅ Dashboard interativo e KPIs
- ✅ Telas de Veículos, Motoristas, Viagens e Abastecimentos
- ⏳ Melhorias UX e features extras

### ⏳ Backend NestJS - Em stand-by (usado futuramente para o Mobile)
- ✅ Configuração NestJS + TypeORM conectando ao Supabase
- ✅ Módulo base (Veículos)
- *Para o MVP Web, o backend não está sendo utilizado, pois o Painel Web consome o Supabase diretamente.*

### ⏳ Mobile (Flutter) - Não iniciado (0%)
- Será desenvolvido nas próximas etapas utilizando a API NestJS.

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
1. [x] Desenvolver painel Web (MVP focado no Dashboard e Módulos CRUD).
2. [x] Habilitar RLS e Policies no Supabase (Segurança de Banco de Dados).
3. [x] Configurar Edge Functions (APIs para Dashboard e Validações customizadas).
4. [ ] Realizar Deploy do Frontend na Vercel (MVP Web 100% Serverless).
5. [ ] Configuração de Contas e Produção Inicial (Adição de Admin).
6. [ ] Retomar desenvolvimento do Backend NestJS como ponte para App Mobile Flutter.
