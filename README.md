# CollabSpace

CollabSpace is an open-source platform that helps college students find teammates for academic, personal, and hackathon projects. Students can share project ideas, describe the skills and roles they need, discover projects, and request to join teams.

## Goals and progress

- [x] Share project ideas and descriptions.
- [x] List the skills and roles needed for a project.
- [x] Discover projects with search, skill filters, and pagination.
- [x] Request to join a project team; owners approve or reject requests.
- [ ] React + Vite + Tailwind interface.
- [ ] Notifications and richer member management.

## Tech stack

| Technology | Purpose |
| --- | --- |
| [React](https://react.dev/) | Builds the user interface from reusable components (planned frontend). |
| JavaScript | Application logic for the frontend and backend. |
| [Vite](https://vite.dev/) | Development server and build tooling for the React frontend (planned). |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling and responsive layouts (planned frontend). |
| [Node.js](https://nodejs.org/) | Runs JavaScript on the server. |
| [Express](https://expressjs.com/) | Defines backend API routes and middleware. |
| [PostgreSQL](https://www.postgresql.org/) | Relational database for application data. |
| [Prisma ORM](https://www.prisma.io/) | Database schema, migrations, and database queries from JavaScript. |
| [Zod](https://zod.dev/) | Request validation for API endpoints. |

## Repository layout

```text
collabspace/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # User, Project, and JoinRequest models
│   │   ├── migrations/        # SQL migrations
│   │   └── seed.js            # Demo users and projects
│   ├── scripts/
│   │   └── run-tests.js       # Applies migrations, then runs node:test
│   ├── src/
│   │   ├── config/            # Environment validation
│   │   ├── controllers/       # HTTP handlers
│   │   ├── lib/               # Prisma client, JWT helpers, error types
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Business logic
│   │   ├── validation/        # Zod request schemas
│   │   ├── app.js             # Express app factory
│   │   └── server.js          # Server bootstrap and graceful shutdown
│   ├── tests/
│   │   └── api.test.js        # API integration tests (node:test + supertest)
│   ├── .env.example
│   └── Dockerfile
├── frontend/                  # Planned React + Vite application
├── docker-compose.yml         # Postgres + API for local development
└── .github/workflows/         # Backend CI with a PostgreSQL service
```

## Getting started

Prerequisites: Node.js 20+, npm, and Docker (for the bundled PostgreSQL), or your own PostgreSQL 14+ instance.

### Run everything with Docker

```bash
JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" docker compose up --build
```

The API is available at <http://localhost:4000> and PostgreSQL at `localhost:55432`.

### Run the API locally

1. Start PostgreSQL:

   ```bash
   docker compose up -d --wait db
   ```

2. Configure and start the backend:

   ```bash
   cd backend
   cp .env.example .env   # then replace JWT_SECRET with a random 32+ character value
   npm install
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

The seed script creates two demo accounts (password `collabspace123`):

- `ada@college.edu`
- `grace@college.edu`

### Run the tests

Tests use the built-in `node:test` runner with `supertest` and run against a real PostgreSQL database. Migrations are applied automatically.

```bash
docker compose up -d --wait db
cd backend
npm test
```

## API reference

Base URL: `http://localhost:4000/api`. Successful responses are wrapped in `{ "data": ... }`; project lists also include a `pagination` object. Errors use `{ "error": { "code": "...", "message": "...", "details": [...] } }`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Service status |
| POST | `/auth/register` | No | Create an account and receive a JWT |
| POST | `/auth/login` | No | Log in and receive a JWT |
| GET | `/auth/me` | Yes | Current user |
| GET | `/projects` | No | List projects (`search`, `skill`, `kind`, `status`, `page`, `limit`) |
| GET | `/projects/:id` | No | Project details and approved member count |
| POST | `/projects` | Yes | Create a project |
| PATCH | `/projects/:id` | Owner | Update a project or close it |
| DELETE | `/projects/:id` | Owner | Delete a project and its join requests |
| POST | `/projects/:id/requests` | Yes | Request to join a project |
| GET | `/projects/:id/requests` | Owner | List join requests for a project |
| PATCH | `/projects/:id/requests/:requestId` | Owner | Approve or reject a join request |
| GET | `/me/requests` | Yes | Join requests sent by the current user |

Send the token as `Authorization: Bearer <token>`. Projects are open and accepting requests by default; pass `status=CLOSED` to list closed projects. The `skill` filter matches project skills exactly and is case-sensitive.

### Example

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.edu","password":"password123","college":"Test College"}'

curl "http://localhost:4000/api/projects?search=events&skill=React"
```

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Yes | — | JWT signing secret (minimum 32 characters) |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `PORT` | No | `4000` | API port |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |

Use `backend/.env.example` as the source of truth. Never commit `.env` files or real credentials.

## Security notes

- Passwords are hashed with bcrypt and tokens are signed with a required 32+ character secret.
- Helmet sets secure HTTP headers, CORS is restricted to configured origins, JSON bodies are limited to 100 KB, and API requests are rate limited outside tests.
- A student can request to join each project once, owners cannot request to join their own project, and only owners can manage requests or edit and delete a project.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Check the existing repository and discuss substantial changes before starting work.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
