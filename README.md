# BusinessFlow API

NestJS 12 API with strict TypeScript, Prisma 7, and PostgreSQL 18. ESM starter based on the Nest CLI template, with Vitest, Oxlint, environment validation, and Prisma integration. The existing schema contains users, departments, roles, and user-role assignments.

## Project documentation

- [Project overview](docs/project-overview.md): product vision, scope, business rules, roadmap, and pending decisions (in Spanish).
- [Agent instructions](AGENTS.md): repository conventions and verification guidance for coding agents (in Spanish).

The overview describes the planned product, not the current implementation status. This README covers setup, execution, and testing.

## Requirements

| Tool       | Version |
| ---------- | ------- |
| Node.js    | 24.21.0 |
| pnpm       | 12.8.1  |
| NestJS     | 12.4.0  |
| TypeScript | 6.0.3   |
| Prisma ORM | 7.10.1  |
| PostgreSQL | 18.6    |

Docker with Compose is needed for local PostgreSQL. Corepack can select the pinned pnpm version from `package.json`.

## Local setup

1. Copy `.env.example` to `.env`. Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `DATABASE_URL`. Use a local password and a URL such as `postgresql://USER:PASSWORD@localhost:5432/businessflow`. Keep `.env` outside Git.
2. Set `TEST_DATABASE_URL=postgresql://postgres@localhost:5433/businessflow_test` if you will run integration tests. The test service uses local trust authentication and binds only to `127.0.0.1`.
3. Run `pnpm install --frozen-lockfile`.
4. Run `docker compose up -d db`. Wait for `docker compose ps` to show `healthy`.
5. Run `pnpm prisma:validate`, `pnpm prisma:generate`, and `pnpm prisma:migrate:deploy`.
6. Run `pnpm start:dev`.

`GET http://localhost:3000/api/v1` returns the starter response `Hello World!`. Application routes use `/api/v1`. Swagger UI is available at `/api/docs` only when `NODE_ENV=development`.

### Database pool

These optional environment variables are validated and converted to numbers at startup. All must be positive integers.

| Variable                         | Default | Purpose                                       |
| -------------------------------- | ------- | --------------------------------------------- |
| `DATABASE_POOL_MAX`              | `10`    | Maximum connections per application instance  |
| `DATABASE_CONNECTION_TIMEOUT_MS` | `5000`  | Maximum wait to acquire a connection, in ms   |
| `DATABASE_IDLE_TIMEOUT_MS`       | `30000` | Time before closing an idle connection, in ms |

The settings are passed to `PrismaPg` as `max`, `connectionTimeoutMillis`, and `idleTimeoutMillis`. Three instances with the default pool can use up to 30 connections. Reserve database capacity for migrations and other clients. Connection timeout does not limit SQL execution time.

`DATABASE_URL` must use `postgres:` or `postgresql:` and include a host and database name. An explicit port must be between 1 and 65535. URL-encode special characters in credentials. Configuration errors identify invalid variable names without displaying their values.

Nest shutdown hooks are enabled for process signals, so the Prisma provider disconnects during application shutdown.

## Commands

| Command                             | Purpose                                            |
| ----------------------------------- | -------------------------------------------------- |
| `pnpm start:dev`                    | Start with reload                                  |
| `pnpm build` / `pnpm start:prod`    | Build / run the build                              |
| `pnpm format` / `pnpm format:check` | Write / check formatting                           |
| `pnpm lint` / `pnpm typecheck`      | Check code                                         |
| `pnpm test`                         | Vitest unit tests                                  |
| `pnpm test:integration`             | Real PostgreSQL integration test                   |
| `pnpm test:e2e`                     | Vitest and Supertest HTTP tests                    |
| `pnpm prisma:validate`              | Validate the schema                                |
| `pnpm prisma:generate`              | Generate the Prisma client                         |
| `pnpm prisma:migrate:dev`           | Create/apply a migration after adding a real model |
| `pnpm prisma:migrate:deploy`        | Apply committed migrations in deployment           |

Start the isolated test service with `docker compose --profile test up -d db-test`, then run `pnpm test:integration`. The test checks that `TEST_DATABASE_URL` points to `businessflow_test` before connecting. It runs a read-only SQL query and creates no tables. Unit and E2E tests do not need a running database. `pnpm test` uses `vitest.config.ts`; HTTP and database commands share `vitest.config.e2e.ts` with explicit file selection. Run `pnpm test:cov` for unit-test coverage. Lint uses the Nest ESM template’s Oxlint configuration.

## Architecture

- `src/config`: startup environment validation. `NODE_ENV`, `PORT`, and `DATABASE_URL` are required.
- `src/app.controller.ts` and `src/app.service.ts`: standard Nest starter response.
- `src/prisma`: Nest provider for the generated Prisma client and PostgreSQL driver adapter.
- `prisma`: Prisma schema, migrations, and seed. The generated client lives in ignored `src/generated/prisma`.
- `test`: integration and E2E tests. Two Vitest configurations cover unit tests and HTTP/database tests. The commands select each level separately; HTTP tests do not query the database.

HTTP errors use Nest's standard exception handling. DTO validation rejects unknown fields, transforms payloads, and returns standard validation messages.

## Migrations

The existing models and committed migrations are preserved. Apply migrations with `pnpm prisma:migrate:deploy`. For schema changes, run `pnpm prisma:migrate:dev --name <change>`, review the SQL, regenerate the client, and commit the migration.

Set `SEED_ADMIN_PASSWORD` in `.env`, then explicitly run `pnpm prisma:seed` to create the initial roles, departments, and administrator (`admin@businessflow.local`). The seed uses upserts; rerunning it does not reset the password of an existing administrator. The seed is never run automatically during application startup.

Prisma 7 reads the CLI database URL from `prisma.config.ts`. The application provides the same URL to `PrismaPg` when it constructs the client. Keep both URLs pointed at the intended environment.

## CI

Pull requests run a frozen pnpm install, Prisma validation and generation, formatting, lint, typecheck, build, unit, integration, and E2E checks. CI starts a PostgreSQL 18.6 service with a disposable `businessflow_test` database and local trust authentication. No production credentials are stored in Git.

## Troubleshooting

- **Environment validation fails:** set all required keys in `.env`; use `postgresql://` or `postgres://` for `DATABASE_URL`.
- **Prisma client import fails:** run `pnpm prisma:generate` before build or tests.
- **Database connection fails:** check `docker compose ps`, port `5432` for the app, and port `5433` for tests. Check that URLs match the Compose users and databases.
- **Integration test rejects the URL:** the test database path must be exactly `/businessflow_test`. Never point the test at your development database.
- **Port is occupied:** stop the other service or change the Compose port mapping and matching URL.
- **Package install blocks scripts:** `pnpm-workspace.yaml` allows Prisma's required build scripts and denies unrelated scripts.
