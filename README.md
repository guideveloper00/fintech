# Fintech — Plataforma de Gestão Financeira Corporativa

> Desafio técnico sênior · Teck Soluções  
> Stack: **NestJS 10 · React 18 · TypeScript · PostgreSQL**

Aplicação full-stack para gestão financeira corporativa com autenticação via **JWT em cookie HttpOnly**, CRUD de categorias e transações com filtros e paginação, e dashboard com indicadores calculados pela API.

---

## Funcionalidades

| Módulo | Funcionalidade |
|---|---|
| **Auth** | Registro, login, logout — token em cookie HttpOnly |
| **Dashboard** | Saldo, receitas, despesas + top 3 categorias por volume de despesas (% do total) |
| **Categorias** | CRUD completo com validação de nome duplicado |
| **Transações** | CRUD com filtros (tipo, categoria, período), paginação e detecção de duplicatas |

---

## Pré-requisitos

- Node.js ≥ 20 · npm ≥ 10 · PostgreSQL rodando localmente

---

## Instalação e execução local

```bash
# 1. Instalar dependências
cd backend && npm install
cd ../frontend && npm install

# 2. Configurar backend
cd backend && cp .env.example .env   # edite com suas credenciais

# 3. Criar banco e rodar migrations
# No PostgreSQL: CREATE DATABASE fintech_db;
npm run migration:run

# 4. Iniciar servidores (terminais separados)
npm run start:dev             # API em http://localhost:3000/api
cd ../frontend && npm run dev  # SPA em http://localhost:5173
```

> O Vite proxy encaminha `/api` → `http://localhost:3000`; sem necessidade de configurar CORS em dev.

### Variáveis de ambiente — `backend/.env`

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

---

## Docker Compose

```bash
cp .env.docker.example .env   # edite JWT_SECRET e DB_PASSWORD
docker compose up -d --build  # app em http://localhost
```

Migrations rodam automaticamente na inicialização.

---

## Deploy (Vercel + Neon)

1. **Banco:** crie um PostgreSQL gratuito no [Neon](https://neon.tech)
2. **Backend:** novo projeto Vercel, root dir `backend`; variáveis de ambiente: `NODE_ENV=production`, `DATABASE_URL`, `DB_SSL=true`, `DB_SYNCHRONIZE=false`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `FRONTEND_URL` (URL do frontend)
3. **Frontend:** novo projeto Vercel, root dir `frontend`; variável: `VITE_API_URL=https://<api>.vercel.app/api`
4. Após o deploy do frontend, atualize `FRONTEND_URL` no backend e redeploy

> 🔗 **Link do deploy:** *(preencher após deploy)*

---

## Credenciais seed

| Campo | Valor |
|---|---|
| E-mail | `admin@fintech.com` |
| Senha | `senha123` |

---

## Testes

```bash
cd backend && npm test
```

**25 testes unitários** em 4 suites:

| Suite | Cobertura |
|---|---|
| `AuthService` | login, usuário inexistente, senha inválida, registro, logout |
| `CategoriesService` | create, findAll, findOne (sucesso / 404 / 403), update, remove |
| `TransactionsService` | create, findAll (sem filtros / com filtros), findOne (sucesso / 404 / 403), update, remove |
| `DashboardService` | saldo zerado, cálculo de saldo, top categorias, despesas sem categoria, histórico só receitas |

---

## Validações e Regras de Negócio

### Backend
- Todas as mensagens de erro dos DTOs estão **em português** via `class-validator`
- **Categorias:** nome único por usuário (case-insensitive) → `409 Conflict`; acesso isolado por usuário → `403 Forbidden`
- **Transações:** filtros combinados (tipo, categoria, período); paginação (padrão 20, máx. 100)
- **Dashboard:** transações sem categoria agrupadas como **"Sem categoria"** (não ignoradas); percentual calculado sobre o total de despesas

### Frontend
- **Categorias:** duplicidade detectada antes de chamar a API (case-insensitive); ao editar, a própria categoria é excluída da comparação
- **Filtros de período:** data final não pode ser anterior à inicial — erro visual imediato, botão desabilitado e atributo `min` no input nativo
- **Transações:** campo Valor com **máscara BRL** (`12345` → `R$ 123,45`); ao criar transação com mesmo valor e data de uma já existente, exibe **modal de confirmação**
- **UX:** "Sem categoria" exibido em negrito; snackbars de feedback em todas as operações CRUD; botões bloqueados durante requisições

---

## Segurança

- JWT em cookie `HttpOnly` — inacessível ao JavaScript (proteção XSS)
- `sameSite: strict` em dev, `sameSite: none` + `secure: true` em produção
- Senha nunca retorna na API (`@Exclude()` + `ClassSerializerInterceptor`)
- `DB_SYNCHRONIZE=false` em produção — schema gerenciado exclusivamente por migrations

---

## Decisões Técnicas

### Backend

| Lib | Alternativa | Motivo |
|---|---|---|
| **TypeORM** | Prisma | Integração nativa com NestJS (`autoLoadEntities`, decorators consistentes); Prisma exige schema separado |
| **passport-jwt** | JWT manual | Padrão oficial do NestJS; Guards e Strategies reconhecidos por qualquer dev da stack |
| **bcrypt** | argon2 | Universal, sem binários nativos problemáticos em ambientes serverless (Vercel) |
| **joi** | zod | Integração direta com `ConfigModule.forRoot({ validationSchema })` do NestJS |
| **class-validator** | zod | Decorators nos DTOs integram com `ValidationPipe` global; tipagem declarativa |

### Frontend

| Lib | Alternativa | Motivo |
|---|---|---|
| **TanStack Query** | SWR / RTK Query | Melhor controle de cache, mutations e invalidação sem boilerplate |
| **Zustand** | Context API / Redux | Zero boilerplate para estado de auth persistido; Context causa re-renders desnecessários |
| **Material UI v7** | Tailwind | Componentes prontos (Table, Dialog, Snackbar) aceleram entrega sem sacrificar funcionalidade |
| **React Hook Form** | Formik | Usa refs em vez de state — menos re-renders; facilita máscara BRL via `Controller` |
| **Axios** | Fetch | Interceptors nativos centralizam `withCredentials: true` e tratamento de erros |
| **Vite** | CRA | CRA descontinuado; Vite tem HMR instantâneo e build significativamente mais rápido |

---

## Scripts úteis

```bash
# Backend
npm run start:dev
npm run migration:run
npm run migration:revert
npm test
npm run test:cov

# Frontend
npm run dev
npm run build
```

---

## Licença

MIT
