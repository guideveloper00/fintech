# Fintech — Plataforma de Gestão Financeira Corporativa

> Desafio técnico sênior · Teck Soluções  
> Stack: **NestJS 10 · React 18 · TypeScript · PostgreSQL 18**

---

## Visão Geral

Aplicação full-stack para gestão financeira corporativa com autenticação segura via **JWT em cookie HttpOnly**, cadastro de categorias, transações com filtros e paginação, e dashboard com indicadores calculados pela API.

---

## Funcionalidades

| Módulo | Funcionalidade |
|---|---|
| **Auth** | Registro, login, logout — token em cookie HttpOnly (sem token no JS) |
| **Dashboard** | Saldo, receitas, despesas do mês + top categorias por gasto |
| **Categorias** | CRUD completo com validações |
| **Transações** | CRUD com filtros (tipo, categoria, período) e paginação |

---

## Estrutura do Projeto (Monorepo)

```
Teste/
├── backend/   # NestJS API
└── frontend/  # React + Vite SPA
```

---

## Pré-requisitos

- Node.js ≥ 20
- PostgreSQL 18 rodando localmente
- npm ≥ 10

---

## Deploy com Docker Compose

### Pré-requisito: Docker 24+ e Docker Compose v2

```bash
# Na raiz do projeto
cp .env.docker.example .env
# Edite .env com suas credenciais (principalmente JWT_SECRET e DB_PASSWORD)

docker compose up -d --build
```

O app ficará disponível em `http://localhost` (ou na porta definida em `APP_PORT`).

As migrations são executadas **automaticamente** na inicialização do backend.

```bash
# Ver logs
docker compose logs -f backend

# Parar tudo
docker compose down

# Destruir dados do banco (cuidado!)
docker compose down -v
```

---

## Deploy — Vercel (Produção)

A aplicação é composta por **dois projetos Vercel independentes**: um para o backend (NestJS serverless) e outro para o frontend (Vite SPA).

### Banco de dados

Crie um banco PostgreSQL gratuito no [Neon](https://neon.tech) (integração nativa com Vercel) ou no [Supabase](https://supabase.com). Salve a connection string — ela será usada nas variáveis de ambiente abaixo.

---

### 1. Deploy do Backend

1. No [Vercel Dashboard](https://vercel.com), clique em **Add New → Project**
2. Importe o repositório e defina:
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build` *(já configurado no `vercel.json`)*
   - **Install Command:** `npm install`
3. Em **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `DB_SSL` | `true` |
| `DB_SYNCHRONIZE` | `false` |
| `JWT_SECRET` | *(string longa e aleatória)* |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | URL do frontend Vercel (adicionar depois) |
| `PORT` | `3000` |

4. Clique em **Deploy**. As migrations rodam automaticamente no primeiro boot.
5. Anote a URL gerada (ex: `https://fintech-api-xyz.vercel.app`).

---

### 2. Deploy do Frontend

1. No Vercel Dashboard, crie outro projeto com:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
2. Em **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `https://fintech-api-xyz.vercel.app/api` |

3. Clique em **Deploy**.
4. Anote a URL do frontend (ex: `https://fintech-app-xyz.vercel.app`).

---

### 3. Conectar os dois projetos

Volte ao projeto **backend** no Vercel → **Settings → Environment Variables** e atualize `FRONTEND_URL` com a URL do frontend. Depois em **Deployments**, redeploy o backend para aplicar.

---

### Credenciais seed

Após o primeiro deploy do backend, o banco já contém um usuário de teste:

| Campo | Valor |
|---|---|
| E-mail | `admin@fintech.com` |
| Senha | `senha123` |

---

## Configuração — Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Edite `.env` com as suas credenciais:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:<senha>@localhost:5432/fintech_db
DB_SSL=false
DB_SYNCHRONIZE=false
JWT_SECRET=troque-este-segredo
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Crie o banco de dados no PostgreSQL:

```sql
CREATE DATABASE fintech_db;
```

Execute as migrations:

```bash
npm run migration:run
```

> Isso cria as tabelas e insere o usuário admin padrão:  
> **e-mail:** `admin@fintech.com` · **senha:** `senha123`

Inicie o servidor em desenvolvimento:

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000/api`.

---

## Configuração — Frontend

```bash
cd frontend
npm install
npm run dev
```

O app estará disponível em `http://localhost:5173`.

> O Vite proxy encaminha `/api` para `http://localhost:3000`, logo nenhuma configuração extra de CORS é necessária em desenvolvimento.

---

## Executar Testes

```bash
cd backend
npm test
```

O projeto conta com **12 testes unitários** em 2 suites:

| Suite | Testes |
|---|---|
| `AuthService` | login com sucesso, usuário inexistente, senha inválida, registro, logout |
| `CategoriesService` | create, findAll, findOne (sucesso / não encontrado / proibido), update, remove |

---

## Variáveis de Ambiente — Referência Completa

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta da API |
| `NODE_ENV` | `development` | Ambiente (`production` habilita HTTPS no cookie) |
| `DATABASE_URL` | — | Connection string PostgreSQL |
| `DB_SSL` | `false` | Habilitar SSL na conexão com o banco |
| `DB_SYNCHRONIZE` | `false` | **Não use `true` em produção** |
| `JWT_SECRET` | — | Segredo para assinar os JWTs |
| `JWT_EXPIRES_IN` | `7d` | Validade do token |
| `FRONTEND_URL` | `http://localhost:5173` | Origem permitida pelo CORS |

---

## Arquitetura de Segurança

- **Token JWT armazenado em cookie `HttpOnly`** — inacessível ao JavaScript, proteção contra XSS.
- **`sameSite: strict`** — proteção contra CSRF.
- **Senha nunca retorna na API** — campo decorado com `@Exclude()` via `ClassSerializerInterceptor`.
- **Migrations-only** — `DB_SYNCHRONIZE=false`, sem sync automático em produção.

---

## Stack Técnica

### Backend
- NestJS 10 · TypeScript strict  
- TypeORM 0.3 · migrations  
- PostgreSQL 18 (uuid-ossp)  
- Passport-JWT + cookie-parser  
- class-validator + class-transformer  
- Jest 29 + ts-jest

### Frontend
- React 18 · Vite · TypeScript strict  
- Material UI v7  
- TanStack Query v5  
- Zustand (persist)  
- Axios (`withCredentials: true`)  
- React Router v6 · React Hook Form

---

## Scripts Úteis

```bash
# Backend
npm run start:dev          # modo desenvolvimento com hot-reload
npm run build              # compilar para produção
npm run migration:generate -- src/database/migrations/<Nome>
npm run migration:run
npm run migration:revert
npm test                   # testes unitários
npm run test:cov           # relatório de cobertura

# Frontend
npm run dev                # servidor de desenvolvimento
npm run build              # build de produção
npm run preview            # visualizar build de produção
```

---

## Licença

MIT
