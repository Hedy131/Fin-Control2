# FinControl — Controle Financeiro Pessoal

Aplicação completa de controle financeiro pessoal: backend em FastAPI, frontend em React (Vite) e banco PostgreSQL.

## Funcionalidades

- Autenticação simples por PIN de 4 dígitos (app de usuário único, sem cadastro)
- Contas (corrente, poupança, cartão, dinheiro, investimento) com saldo calculado
- Categorias de receita e despesa
- Transações (receita, despesa, transferência) com filtros
- Orçamentos mensais por categoria com acompanhamento de gasto
- Painel com saldo total, resumo do mês, gráfico de despesas por categoria e tendência de 6 meses

## Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic, JWT (python-jose), Passlib (bcrypt)
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts, Axios
- **Banco:** PostgreSQL 16
- **Infra:** Docker + docker-compose

## Estrutura do projeto

```
fincontrol/
├── backend/
│   ├── app/
│   │   ├── core/         # config, database, security (JWT/hash)
│   │   ├── models/       # modelos SQLAlchemy
│   │   ├── schemas/      # schemas Pydantic
│   │   ├── crud/         # operações de banco
│   │   ├── api/routes/   # endpoints (auth, users, accounts, categories, transactions, budgets, dashboard)
│   │   └── main.py
│   ├── alembic/          # migrações
│   ├── seed.py           # popula categorias padrão para um usuário
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/          # clientes axios por recurso
│   │   ├── context/      # AuthContext
│   │   ├── components/   # Layout, Dashboard, Accounts, Categories, Transactions, Budgets
│   │   └── pages/        # Login, Dashboard, Accounts, Categories, Transactions, Budgets
│   └── Dockerfile
└── docker-compose.yml
```

## Como rodar (Docker — recomendado)

Pré-requisito: Docker e Docker Compose instalados.

```bash
cd fincontrol
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend (docs Swagger): http://localhost:8000/docs
- PostgreSQL: localhost:5432

As tabelas são criadas automaticamente na inicialização do backend (`Base.metadata.create_all`). Para usar migrações versionadas com Alembic em produção, gere a revisão inicial dentro do container:

```bash
docker-compose exec backend alembic revision --autogenerate -m "initial"
docker-compose exec backend alembic upgrade head
```

## Como rodar sem Docker (desenvolvimento local)

### 1. PostgreSQL

Suba um PostgreSQL local ou em container e ajuste `backend/.env` com a `DATABASE_URL`.

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # ajuste conforme necessário
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev
```

## Primeiros passos após subir a aplicação

1. Acesse http://localhost:5173/login e entre com o PIN definido em `APP_PIN` (`backend/.env`, padrão `1234`).
2. Cadastre pelo menos uma **Conta** (ex.: Conta Corrente).
3. Cadastre **Categorias** de receita e despesa (ou rode `python seed.py` dentro do container backend para popular categorias padrão).
4. Lance **Transações** vinculadas a conta e categoria.
5. Defina **Orçamentos** mensais por categoria de despesa.
6. Acompanhe tudo no **Painel**.

## Variáveis de ambiente

`backend/.env`:
- `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `BACKEND_CORS_ORIGINS`, `APP_PIN`

`frontend/.env`:
- `VITE_API_URL` (padrão `http://localhost:8000/api`)

**Importante:** troque `SECRET_KEY` e `APP_PIN` por valores próprios antes de usar em produção.

## Endpoints principais da API

- `POST /api/auth/login` (body `{ "pin": "1234" }`)
- `GET/PUT /api/users/me`
- `GET/POST/PUT/DELETE /api/accounts`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/transactions`
- `GET/POST/PUT/DELETE /api/budgets`
- `GET /api/dashboard/summary`

Documentação interativa completa em `/docs` (Swagger) e `/redoc`.
# Fin-Control2
