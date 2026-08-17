# WorkoutLogApp — Developer Handoff Context

Last updated: August 12, 2026

This document records the current technical state of the project. Repository-wide mentoring and collaboration instructions live in [`../AGENTS.md`](../AGENTS.md).

When this document and the implementation disagree, treat the code and current verification results as the source of truth, then update this document.

## 1. Project Purpose

WorkoutLogApp is a full-stack workout application and portfolio project. Its current product capabilities are centered on authentication and workout-template management.

Users can currently:

- Sign up and log in.
- Retrieve their profile.
- Create workout programs containing workouts and exercises.
- Retrieve programs, their workouts, and linked exercises.
- Delete programs and remove workout-program relationships.

The next product milestone is a complete workout-session flow so users can record completed exercises and sets, finish a session, and view workout history.

The engineering goal is a maintainable, tested, observable, and deployable application—not the premature addition of technologies solely for portfolio value.

## 2. Current Stack

### Frontend

- React
- Vite
- React Router
- Context API for authentication state
- Browser `fetch`
- JavaScript and JSX
- ESLint

### Backend

- Node.js 24
- Express 5
- Strict TypeScript
- CommonJS output
- PostgreSQL through `pg`
- bcrypt
- `jsonwebtoken`
- Zod 4
- Pino and `pino-http`
- dotenv

### Testing and automation

- Jest
- Supertest
- Babel for transforming TypeScript tests
- Separate PostgreSQL test database
- GitHub Actions continuous integration

### Planned infrastructure

- Versioned database migrations
- Docker and Docker Compose
- AWS staging deployment
- Continuous deployment after CI succeeds

## 3. Repository Instructions and Documentation

- `AGENTS.md`: mentoring, learning, debugging, review, and collaboration behavior.
- `README.md`: setup, commands, current features, and high-level project presentation.
- `docs/architecture.md`: architecture and major design decisions.
- `docs/roadmap.md`: current engineering and product sequence.
- `backend/CONTEXT.md`: current backend handoff and active implementation state.

Do not turn this file into a chronological development journal. Remove obsolete plans when a phase is completed.

## 4. Engineering Workflow

Work is organized with GitHub issues, milestones, feature branches, commits, pull requests, and required CI checks.

### Branch naming

```text
<type>/<issue-number>-short-description
```

Examples:

```text
feat/28-github-actions
feat/29-standardize-jwt-auth
```

### Commit naming

Use focused conventional prefixes:

```text
feat:
fix:
refactor:
test:
docs:
ci:
chore:
style:
```

### Pull requests

- Target `main`.
- Describe the issue-level outcome.
- Confirm both required CI jobs pass.
- Do not merge known broken or incomplete work.
- `main` requires a pull request and successful backend/frontend verification.
- Required approving reviews are currently disabled because this is a solo repository and authors cannot approve their own pull requests.

## 5. Backend Architecture

### Request flow

```text
HTTP request
→ Pino request logger and request ID
→ Express router
→ authentication middleware when protected
→ Zod request-body validation when applicable
→ controller
→ typed database query layer
→ PostgreSQL
→ HTTP response
```

### Error flow

```text
Expected application failure
→ next(AppError)
→ centralized error middleware
→ stable status and JSON message

Unexpected failure
→ next(error)
→ request-scoped error log
→ generic 500 response
```

### Layer responsibilities

#### Routers

- Define paths and HTTP methods.
- Compose middleware.
- Connect requests to controllers.

#### Middleware

- Authenticate access tokens.
- Validate untrusted request bodies.
- Attach request-scoped logging.
- Convert errors into API responses.

#### Controllers

- Coordinate request-specific business behavior.
- Enforce ownership through database queries.
- Manage transaction boundaries when coordinating multiple writes.
- Translate expected database failures into application errors.
- Preserve stable API response shapes.

#### Database query layer

- Own SQL.
- Type inputs, `PoolClient` transaction parameters, result rows, and return values.
- Distinguish `null`, `undefined`, empty arrays, and booleans.
- Let query failures propagate unless cleanup, rollback, recovery, or meaningful translation is required.

#### PostgreSQL

- Own persistent relational integrity through keys, constraints, and transactions.
- The current schema is initialized from `backend/db/init.sql`.
- Versioned migrations have not yet been introduced.

## 6. Application and Server Separation

`backend/app.ts` constructs and exports the Express application. It registers:

- Request logging
- CORS
- JSON parsing
- Health/root route
- API routes
- Catch-all 404 handling
- Centralized error middleware

`backend/server.ts` imports the application and calls `listen()`.

Supertest imports `app.ts` directly, allowing integration tests to run without opening a network port.

## 7. TypeScript Architecture

The backend source and integration tests have been migrated to TypeScript.

- `backend/tsconfig.json` checks production source and emits CommonJS JavaScript to `backend/dist/`.
- `backend/tests/tsconfig.json` typechecks Jest tests without emitting files.
- `tsx` runs TypeScript directly during development.
- Babel removes TypeScript syntax before Jest executes tests.
- Express's `Request` interface is augmented in `backend/types/express.d.ts` with optional `user_id?: number`.
- Database row interfaces live in `backend/types/entities.ts`.
- Zod schemas infer validated request-body types.

The project intentionally remains CommonJS. The TypeScript migration was not an ES module migration.

`allowJs` remains enabled in `backend/tsconfig.json` as migration-era technical debt even though backend application files are now TypeScript.

## 8. Configuration

The centralized immutable configuration object is exported from `backend/config/index.ts`.

Environment modes:

```text
development
test
production
```

Local development loads `.env`, tests load `.env.test`, and production expects its environment to provide configuration without a local environment file.

Current configuration includes:

```text
config.env
config.server.port
config.server.environment
config.database.host
config.database.port
config.database.name
config.database.user
config.database.password
config.auth.jwtSecret
config.auth.jwtExpiresIn
config.auth.jwtIssuer
config.auth.jwtAudience
config.client.url
```

Required authentication configuration is being expanded during the current JWT issue:

```text
JWT_SECRET
JWT_ISSUER
JWT_AUDIENCE
```

`JWT_EXPIRES_IN` defaults to `24h` and is validated against the supported duration format.

Important current follow-up: synchronize `JWT_ISSUER` and `JWT_AUDIENCE` across `.env`, `.env.test`, `.env.example`, and the backend CI job before verification.

## 9. Runtime Validation

TypeScript cannot validate data received at runtime. Zod validates request bodies before controllers receive them.

```text
Untrusted JSON
→ route-specific Zod schema
→ validateRequest middleware
→ parsed and normalized req.body
→ typed controller
```

Current schemas:

- `signupSchema`
- `loginSchema`
- `programSchema`
- Nested workout and linked-exercise schemas

Validation failures return:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "workouts.0.exercises.0.name",
      "message": "Exercise name is required"
    }
  ]
}
```

Validation covers input shape and field rules. It does not replace business checks such as uniqueness, ownership, or resource existence.

## 10. Error Handling

Custom error hierarchy:

```text
AppError
├── BadRequestError       400
├── ValidationError       400
├── UnauthorizedError     401
├── NotFoundError         404
└── ConflictError         409
```

Expected errors preserve their status and message. Validation errors also include structured field errors. Unexpected errors are logged once through `req.log.error({ err }, ...)` and return:

```json
{
  "message": "Internal server error"
}
```

Chosen semantics:

- `400`: malformed or invalid input.
- `401`: missing or invalid authentication credentials.
- `403`: valid identity that lacks permission; not currently common because ownership failures deliberately return `404`.
- `404`: missing or inaccessible resource without revealing another user's resource.
- `409`: uniqueness conflict such as an existing email or program name.
- Empty child collections return `200` with an empty array when the parent exists.

## 11. Request Logging and Observability

Pino request logging is complete.

For each request, `pino-http`:

- Generates a UUID request ID.
- returns it in the `X-Request-Id` response header.
- Attaches a request-scoped logger to `req.log`.
- Logs request completion, status, and response time.
- Uses `info` for successful responses, `warn` for `4xx`, and `error` for `5xx` or request errors.

Logger behavior:

- Development uses readable `pino-pretty` output and debug level.
- Tests silence logs.
- Other environments emit structured JSON at info level.
- Authorization, cookies, and set-cookie headers are redacted.
- Unexpected errors are logged in centralized error middleware with the request ID.

Never log access tokens, passwords, password hashes, secrets, or raw authentication headers.

## 12. Database and Program Creation

Program creation uses a PostgreSQL transaction:

```text
BEGIN
→ create program
→ create workout shells
→ find or create exercises
→ link exercises to workouts
→ link workouts to program
→ COMMIT
```

On failure, the controller rolls back and releases the transaction client.

Ownership helpers include:

- `programExistsForUser(programId, userId)`
- `workoutExistsForProgram(workoutId, programId)`

Database queries are typed, but database constraints and nullability need a dedicated future review. Do not casually change schema behavior during unrelated issues.

## 13. Testing

Most backend tests are route-level integration tests:

```text
Supertest request
→ Express middleware
→ controller
→ PostgreSQL test database
→ error middleware
→ asserted HTTP response
```

Current test files:

```text
tests/auth.test.ts
tests/loginRoutes.test.ts
tests/signupRoutes.test.ts
tests/programRoutes.test.ts
tests/programValidation.test.ts
tests/requestLogging.test.ts
tests/testHelper.ts
```

`setupTestData()` resets and seeds a separate PostgreSQL test database. `endTesting()` closes database resources after a suite.

Current coverage includes:

- Signup and login success/failure.
- User retrieval.
- Missing and malformed authentication.
- Program creation, duplicate names, retrieval, and deletion.
- Workout-program removal.
- Program/workout/exercise ownership and missing-resource behavior.
- Nested program validation and defaults.
- Request ID and logging behavior.

## 14. Continuous Integration

`.github/workflows/ci.yml` runs on:

- Pull requests targeting `main`.
- Pushes to `main`.
- Manual dispatch.

Backend job:

```text
checkout
→ Node 24
→ npm ci
→ PostgreSQL 14 service
→ initialize db/init.sql with ON_ERROR_STOP
→ npm run verify
```

Frontend job:

```text
checkout
→ Node 24
→ npm ci
→ npm run lint
→ npm run build
```

Actions are pinned to full commit SHAs. The workflow uses least-privilege `contents: read` permission. Backend and frontend are independent jobs and required checks on `main`.

## 15. Commands

Run backend commands from `backend/`:

```text
npm run dev             Run the development server with tsx watch
npm run typecheck       Typecheck production source without emitting
npm run typecheck:test  Typecheck tests without emitting
npm test                Run Jest/Supertest integration tests
npm run build           Compile production source to dist
npm run verify          Run both typechecks, tests, and production build
npm start               Run dist/server.js in production mode
```

Run frontend commands from `client/`:

```text
npm run dev
npm run lint
npm run build
```

TypeScript produces no output when `tsc --noEmit` succeeds. A zero exit code confirms success.

## 16. Authentication Baseline

Before the current issue, login and signup signed a JWT containing a private numeric `user_id` claim. Protected middleware read `Authorization: Bearer <token>`, verified the token, and attached the numeric ID to `req.user_id`.

The frontend stores the access token in `localStorage` and removes it from local storage and React state during logout.

Known security limitations:

- `localStorage` tokens can be stolen by JavaScript executing through XSS or a compromised dependency.
- Client-side logout discards only that client's copy; it does not revoke another copy of a stateless JWT.
- There is no refresh-token flow, token rotation, denylist, or server-side session store.
- Refresh tokens and true server-side revocation are deliberately outside the current issue.

## 17. Current Work: Standardize JWT Access Tokens

The active engineering task is to standardize access-token issuance, verification, errors, tests, and documentation.

### Intended token contract

The access token should contain:

```text
sub        User ID encoded as a positive-integer string
token_use  Literal "access"
iss        Configured issuer
aud        Configured API audience
iat        Integer issued-at timestamp
exp        Integer expiration timestamp
```

Security policy:

- Sign and verify only with `HS256`.
- The server—not the incoming JWT header—chooses allowed algorithms.
- Verify signature, expiration, issuer, and audience before trusting claims.
- Validate verified claims with Zod.
- Convert `sub` to a positive safe integer before assigning `req.user_id`.
- Use the token module as the single owner of JWT signing and verification.

### Intended ownership

- `backend/auth/accessToken.ts`: token contract, issuance, and verification.
- `userController.ts`: verify credentials or create the user, then request a token.
- `authMiddleware.ts`: strictly parse the Bearer header, verify the token, attach `req.user_id`, and translate failures into `401` responses.
- Frontend: discard its token and authentication state on logout or unauthorized responses.

### Current work-in-progress state

The following uncommitted implementation work exists:

- `config.auth` now includes issuer and audience.
- `backend/auth/accessToken.ts` exists with a Zod claim schema and initial issue/verify functions.
- Login and signup call `issueAccessToken()`.
- Authentication middleware calls `verifyAccessToken()`.

The implementation is not complete yet. Required fixes identified during review:

1. Validate issued user IDs with `Number.isSafeInteger(userId)` and `userId > 0`.
2. Throw on invalid issuance input rather than returning an empty token.
3. Type verification options and use `algorithms: ["HS256"]`; the singular signing property `algorithm` is not the verification allowlist.
4. Use the shared secret constant consistently.
5. Optionally make the claim schema strict.
6. Strictly parse the complete Bearer header instead of accepting prefixes or extra segments.
7. Assign the verified ID to `req.user_id` before calling `next()`.
8. Distinguish missing, expired, and otherwise invalid access-token responses.
9. Add focused token tests and route-level authentication tests.
10. Update architecture documentation and environment examples.
11. Add issuer and audience to the GitHub Actions backend environment before CI runs.

Recommended public authentication errors:

```text
Missing credential  → 401 "Access token required"
Expired token       → 401 "Access token expired"
Other invalid token → 401 "Invalid access token"
```

Do not log the raw token or expose internal JWT/Zod error details to clients.

### Test matrix still required

- Login and signup return tokens with the standardized claims.
- Valid access token reaches a protected route.
- Missing authorization header.
- Wrong authorization scheme.
- `Bearer` without a credential.
- Extra header segments.
- Malformed token.
- Wrong signing secret.
- Expired token.
- Wrong issuer.
- Wrong audience.
- Missing, malformed, zero, negative, decimal, or unsafe `sub`.
- Wrong `token_use`.

## 18. Immediate Workflow Warning

At the time of this update, the local branch is still:

```text
feat/28-github-actions
```

and JWT work is uncommitted. Before committing JWT changes, confirm issue #28 is merged, update local `main`, and move the JWT changes onto the correct issue branch. Do not accidentally commit the new authentication work to the completed CI branch.

Also preserve unrelated user changes in `docs/roadmap.md` and `middleware/validateRequest.ts`; do not overwrite or revert them without inspection.

## 19. Roadmap

Current sequence:

1. Structured request logging — completed.
2. GitHub Actions CI and branch protection — completed remotely; synchronize local branches as needed.
3. Standardize JWT access-token authentication — in progress.
4. Introduce versioned database migrations.
5. Implement workout-session API.
6. Build active workout-tracking interface.
7. Add workout history and previous performance.
8. Dockerize the application.
9. Deploy an AWS staging environment.
10. Add continuous deployment.
11. Complete portfolio-quality security, API documentation, end-to-end testing, and presentation.

Deliberately deferred until justified:

- Refresh tokens and server-side token revocation.
- AI-generated workout programming.
- Redis caching.
- Microservices and Kubernetes.
- Advanced analytics and background messaging infrastructure.

## 20. Definition of Done for Meaningful Changes

Before merging an issue:

1. Acceptance criteria are satisfied.
2. The narrowest relevant checks pass during implementation.
3. `npm run verify` passes for backend changes.
4. Frontend lint and build pass for frontend changes.
5. Failure cases and security implications are reviewed.
6. The final diff contains no accidental or unrelated changes.
7. README, architecture, roadmap, environment examples, and this context are updated where relevant.
8. The pull request clearly describes the change and verification performed.
9. Required GitHub checks pass before merge.
