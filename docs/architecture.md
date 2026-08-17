# WorkoutLogApp Architecture

## Overview

WorkoutLogApp is a full-stack workout tracking platform with a React frontend, TypeScript/Express backend, and PostgreSQL database.

## System Architecture

```text
                 Browser
                    │
                    ▼
             React Frontend
                    │
          HTTPS / REST API
                    │
                    ▼
         TypeScript / Express Server
                    │
      ┌─────────────┴─────────────┐
      │                           │
Authentication              Business Logic
      │                           │
      └─────────────┬─────────────┘
                    │
                    ▼
              PostgreSQL
```

## Frontend

The React frontend is responsible for:

- User authentication
- Displaying workout data
- Creating workout programs
- Managing authentication state
- Communicating with the backend through REST APIs

## Backend Architecture

```text
Request
  |
  v
Request Loggin / Request ID
  |
  v
Router
  |
  v
Auth / Zod Request Validation
  |
  v
Controller
  |
  v
Database Layer
  |
  v
PostgreSQL
```

Routers compose endpoints and middleware. Authentication and Zod validation run before controllers. Controllers coordinate business behavior and transactions, while query modules own SQL and PostgreSQL result typing. Expected failures are forwarded to centralized Express error middleware.

## Request Logging and Observability

The backend uses Pino for structured application logging and `pino-http` for HTTP request logging.

The request-logging middleware runs near the beginning of the Express middleware chain. For every request, it:

- Generates a UUID request identifier
- Returns the identifier through the `X-Request-Id` response header
- Attaches a request-scoped child logger to `req.log`
- Records the request method, URL, response status, and response time
- Logs successful and redirect responses at `info`
- Logs `4xx` responses at `warn`
- Logs `5xx` responses at `error`

The request ID allows application and HTTP completed logs from the same request to be correlated.

```text
Incoming request
 -> generate request ID
 -> execute middleware and controller
 -> log unexpected error with req.log
 -> send response
 -> log status and response time
```

## TypeScript Architecture

The backend uses strict TypeScript for application source, database access, middleware, controllers, routers, and integration tests.

- `backend/tsconfig.json` checks production source and compiles it to `backend/dist/`.
- `backend/tests/tsconfig.json` extends the production configuration, adds Jest globals, and typechecks tests without emitting files.
- `tsx` executes TypeScript directly during development and watches for source changes.
- `tsc` produces the production build.
- Babel removes TypeScript syntax before Jest executes integration tests.
- The package remains CommonJS. The TypeScript migration deliberately did not include an ES module migration.

```text
Development:  server.ts -> tsx watch -> Node.js
Production:   server.ts -> tsc -> dist/server.js -> Node.js
Tests:        *.test.ts -> test typecheck + Babel -> Jest/Supertest
```

### Static types and runtime validation

TypeScript checks code during development and build time, but its types do not exist after compilation. It therefore cannot determine whether an incoming HTTP body is trustworthy. Zod validates request bodies at runtime, applies trimming, normalization, and defaults, and replaces `req.body` with parsed data before the controller runs.

Zod-inferred types connect the two layers:

```text
Untrusted JSON
  -> Zod schema and validation middleware
  -> parsed request body
  -> typed controller
  -> typed database query
  -> PostgreSQL
```

Express request augmentation defines the optional authenticated `user_id`. Protected controllers narrow that value before passing it to database functions. Route controllers also type URL parameters explicitly and convert their original string values to validated numeric IDs.

Database row interfaces describe PostgreSQL results. Query functions type their inputs, transaction `PoolClient` parameters, query rows, and return values, including distinctions among `null`, `undefined`, empty arrays, and booleans.

## Testing Architecture

Jest and Supertest exercise the API through the Express application without opening a network port. Tests use a separate PostgreSQL database configured through `.env.test`. The setup helper resets and seeds fixture data, and test teardown closes the database pool.

The test pipeline has two separate responsibilities:

- TypeScript checks test code through `tests/tsconfig.json`.
- Babel transforms TypeScript syntax so Jest can execute the tests.

`npm run verify` runs production typechecking, test typechecking, the integration suite, and a production build.

## Database

```text
Users

↓

Programs

↓

Program Workouts

↓

Workouts
```

## Authentication Flow

```text
--> Validate credentials
--> Issue standardized access token
--> Frontend stores token
--> Send Authorization: Bearer <token>
--> strictly parse the header
--> verify jwt
--> validate with zod schema
--> convert sub to numeric user id
--> attach to req.user_id
--> continue to protected controller
```

---

## Error Handling

- Controllers forward errors using `next(error)`.
- Expected application errors use custom AppError subclasses.
- Supported errors currently include 400, 401, 404, and 409
- Unexpected errors are logged with structured details and the request ID before a generic 500 response is returned.

---

## Key Design Decisions

### Why TypeScript?

TypeScript was added to make contracts between schemas, middleware, controllers, and database queries explicit. It catches mismatched request bodies, missing authenticated identifiers, incorrect route-parameter use, nullable database values, and invalid query return assumptions before runtime.

### Why Zod when TypeScript is already used?

TypeScript only checks code at compile time. Zod validates data that enters the running application, including HTTP request bodies. Zod also produces inferred TypeScript types, preventing separate runtime schemas and request-body interfaces from drifting apart.

### Why PostgreSQL?

PostgreSQL was chosen because the core data model is relational. Users, programs, workouts, exercises, and logged workout data all have clear relationships that benefit from structured schemas, joins, constraints, and query optimizations.

### Why JWT?

JWT authentication was chosen to support stateless API authentication between the React frontend and Express backend. This keeps protected backend routes independent of server-side session storage and works well with a REST API structure.

Current limitation: the application uses a 24-hour JWT expiration. A future authentication sprint will introduce refresh tokens, token rotation, and improved logout/session invalidation.

### Why REST instead of GraphQL?

REST was chosen because the application currently has straightforward resource-based operations such as users, programs, and workouts. REST keeps the API simple, predictable and easy to test while the project is still evolving.

GraphQL may be considered later if the frontend begins requiring more complex, flexible querying across related workout, exercise, and analytics data.

### Why a Monolith?

The backend currently uses a monolithic Express architecture because the project is still early-stage and benefits from simplicity. Keeping routes, middleware, controllers, and database access in one backend service makes the system easier to develop, test, debug, and deploy.

A distributed or microservice architecture would add unnecessary complexity at this stage. If the project grows significantly, specific responsibilities such as analytics, notifications, or background jobs could be separated later.

---

## Current Technical Debt

- JWTs are currently implemented with a 24-hour expiration.
- Refresh tokens and token rotation are planned for a future security-focused sprint.
- The application is not containerized yet.
- Deployment is not yet production-ready.
- API documentation is not yet generated with OpenAPI/Swagger.
- The backend still retains incremental-migration compatibility settings such as `allowJs`.

## Planned Architecture

```text
                 Browser
                    │
                    ▼
             React Frontend
                    │
              HTTPS / REST API
                    │
                    ▼
              Express Server
                    │
      ┌─────────────┴─────────────┐
      │                           │
 PostgreSQL Database        Redis Cache
      │
      ▼
 Application Data

GitHub Actions
      │
      ▼
 AWS Deployment

Docker / Docker Compose will be used to containerize the frontend, backend, and database for consistent local development and deployment.
```
