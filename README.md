# Fintech — Plataforma de Gestão Financeira Corporativa

> Desafio técnico sênior · Teck Soluções  
> Stack: **NestJS 10 · React 18 · TypeScript · PostgreSQL**

Aplicação full-stack para gestão financeira corporativa com autenticação via **JWT em cookie HttpOnly**.

> **Destaque de implementação:** paginação e ordenação de ambas as tabelas (Transações **e** Categorias) são processadas inteiramente no banco de dados — parâmetros `page`, `limit`, `sortBy` e `sortOrder` trafegam na query string, o backend aplica `OFFSET/LIMIT` e `ORDER BY` via TypeORM QueryBuilder e devolve `{ items, total, page, limit, totalPages }`. O frontend nunca ordena ou fatia arrays em memória.

---

## Arquitetura

**Backend — Arquitetura Modular do NestJS**  
Cada domínio (`Auth`, `Users`, `Categories`, `Transactions`, `Dashboard`) é encapsulado em seu próprio módulo com controller, service, DTOs e entidade TypeORM. Os módulos se comunicam apenas via injeção de dependência — nunca importam repositórios uns dos outros diretamente. Infraestrutura transversal (filtros globais, interceptor de resposta, guards, decorators) vive em `common/`.

**Frontend — Feature Folders**  
Cada página/funcionalidade tem sua própria pasta em `pages/` contendo `index.tsx`, subpasta `Components/` e `types/`. Código genuinamente compartilhado (hooks, componentes de layout, tipos globais, helpers) fica em `shared/`. Isso mantém cada feature autocontida e facilita encontrar tudo relacionado a um contexto num único lugar.

---

## Funcionalidades

| Módulo | Funcionalidade |
|--------|----------------|
| **Auth** | Registro, login, logout — token em cookie HttpOnly |
| **Dashboard** | Saldo, receitas, despesas + top 3 categorias por volume de despesas (% do total) |
| **Categorias** | CRUD completo, **paginação server-side** (20/pág), **ordenação server-side** por Nome / Descrição / Data de criação, validação de nome duplicado |
| **Transações** | CRUD, **paginação server-side** (20/pág), **filtros server-side** (tipo, categoria, período), **ordenação server-side** por Descrição / Valor / Tipo / Data / Categoria, detecção de duplicatas |

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

# 4. Criar usuário seed (admin@fintech.com / senha123) + categorias de exemplo
npm run seed

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

> Para rodar tudo localmente com Docker ou fazer deploy em uma VPS. Usa os `Dockerfile` de ambos os serviços. **Não é o fluxo Railway/Vercel.**

```bash
cp .env.docker.example .env   # edite JWT_SECRET e DB_PASSWORD
docker compose up -d --build  # app em http://localhost
```

Migrations rodam automaticamente na inicialização.

---

## Deploy

### Backend + Banco — Railway (recomendado para NestJS)

1. Crie conta em [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub** → selecione o repo, root dir `backend`
   > Railway detecta o `backend/Dockerfile` automaticamente e o utiliza para buildar o container — não é necessário configurar nada extra.
3. Dentro do projeto, clique em **Add Service → Database → PostgreSQL** — Railway provisiona e injeta `DATABASE_URL` automaticamente
4. Configure as variáveis de ambiente no serviço do backend:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(injetado automaticamente pelo Railway)* |
| `DB_SSL` | `true` |
| `DB_SYNCHRONIZE` | `false` |
| `JWT_SECRET` | *(string aleatória segura)* |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | URL do frontend (preencher após o deploy do front) |

5. Railway detecta o `Dockerfile` na pasta `backend` e faz o build automaticamente. As migrations rodam no `CMD` do container.

### Frontend — Vercel

> O `frontend/Dockerfile` **não é usado** pelo Vercel — ele existe apenas para o `docker-compose` local e deploys em VPS. O Vercel usa seu próprio pipeline: detecta o Vite, roda `npm run build` e serve os estáticos via CDN.

1. Importe o repo no [vercel.com](https://vercel.com), root dir `frontend`
2. Adicione a variável de ambiente:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://<sua-api>.railway.app/api` |

3. Deploy. Após obter a URL do frontend, volte ao Railway e atualize `FRONTEND_URL` no backend → redeploy automático.

> 🔗 **API:** https://fintech-back-production.up.railway.app/api  
> 🔗 **Frontend:** https://fintech-gt.vercel.app

---

## Credenciais seed

| Campo | Valor |
|-------|-------|
| E-mail | `admin@fintech.com` |
| Senha | `senha123` |

---

## Testes

```bash
cd backend && npm test
```

**25 testes unitários** em 4 suites:

| Suite | Cobertura |
|-------|-----------|
| `AuthService` | login, usuário inexistente, senha inválida, registro, logout |
| `CategoriesService` | create, findAll, findOne (sucesso / 404 / 403), update, remove |
| `TransactionsService` | create, findAll (sem filtros / com filtros), findOne (sucesso / 404 / 403), update, remove |
| `DashboardService` | saldo zerado, cálculo de saldo, top categorias, despesas sem categoria, histórico só receitas |

---

## Paginação e Ordenação Server-Side

Ambas as tabelas delegam toda a paginação e ordenação ao banco de dados — nenhum array é ordenado ou fatiado no frontend.

### Transações — `GET /api/transactions`
```
page=1 &limit=20 &sortBy=date &sortOrder=desc
&type=expense &categoryId=<uuid> &startDate=2025-01-01 &endDate=2025-12-31
```
Colunas ordenáveis: `description · amount · type · date · category` (a última faz JOIN com a tabela de categorias e ordena por `category.name`).

### Categorias — `GET /api/categories`
```
page=1 &limit=20 &sortBy=createdAt &sortOrder=desc
```
Colunas ordenáveis: `name · description · createdAt`.

O mesmo endpoint é reutilizado pelos dropdowns de transações — nesse caso o frontend envia `limit=500&sortBy=name&sortOrder=asc` para obter todas as categorias de uma vez, sem paginação visível ao usuário.

### Shape da resposta paginada
```jsonc
{
  "items": [...],
  "total": 87,
  "page": 2,
  "limit": 20,
  "totalPages": 5
}
```

---

## Validações e Regras de Negócio

### Backend
- Todas as mensagens de erro dos DTOs estão **em português** via `class-validator`
- **Categorias:** nome único por usuário (case-insensitive) → `409 Conflict`; acesso isolado por usuário → `403 Forbidden`
- **Transações:** filtros combinados (tipo, categoria, período); paginação (padrão 20, máx. 100)
- **Dashboard:** transações sem categoria agrupadas como **"Sem categoria"** (não ignoradas); percentual calculado sobre o total de despesas

### Frontend
- **Categorias:** validação de duplicidade de nome delegada ao backend (409); snackbar exibe a mensagem retornada pela API
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
|-----|-------------|--------|
| **TypeORM** | Prisma | Integração nativa com NestJS (`autoLoadEntities`, decorators consistentes); Prisma exige schema separado |
| **passport-jwt** | JWT manual | Padrão oficial do NestJS; Guards e Strategies reconhecidos por qualquer dev da stack |
| **bcrypt** | argon2 | Universal, sem binários nativos problemáticos em ambientes serverless (Vercel) |
| **joi** | zod | Integração direta com `ConfigModule.forRoot({ validationSchema })` do NestJS |
| **class-validator** | zod | Decorators nos DTOs integram com `ValidationPipe` global; tipagem declarativa |

### Frontend

| Lib | Alternativa | Motivo |
|-----|-------------|--------|
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
