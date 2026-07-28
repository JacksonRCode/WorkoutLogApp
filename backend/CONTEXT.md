# Workout Tracker — Developer Handoff Context

## 1. Project Overview

**Project:** Workout Tracker / WorkoutLogApp  
**Repository:** `github.com/jackdareid/WorkoutLogApp`  
**Primary goal:** Build a production-ready full-stack workout tracking application that demonstrates strong backend architecture, testing, database design, authentication, validation, deployment, and engineering workflow practices.

The application allows authenticated users to:

- Create accounts and log in.
- Create workout programs.
- Create workouts within programs.
- Add existing or custom exercises to workouts.
- Retrieve programs, workouts, and exercises.
- Remove programs and workout-program relationships.
- Eventually track completed workouts, exercise performance, and automated progression.

The project is also intended to serve as a flagship portfolio project for junior software engineering applications.

---

## 2. Current Technology Stack

### Frontend

- React
- Vite
- React Router
- Context API for authentication
- Browser `fetch`
- JWT stored in `localStorage`

### Backend

- Node.js
- Express
- CommonJS modules
- PostgreSQL
- `pg` connection pool
- bcrypt
- jsonwebtoken
- Zod for request validation
- dotenv-based environment configuration

### Testing

- Jest
- Supertest
- Separate PostgreSQL test database
- Integration tests against the Express app
- Test database seeding helper

### Infrastructure and Deployment

- Docker planned
- AWS deployment planned
- Likely AWS services:
  - EC2
  - RDS
  - CloudWatch
  - IAM
- Production environment variables will be supplied by the hosting environment rather than local `.env` files.

---

## 3. Engineering Workflow

Development is organized through GitHub issues, milestones, branches, commits, pull requests, and a GitHub Projects board.

### Branch naming

```text
<type>/<issue-number>-short-description
```

Examples:

```text
feat/16-centralized-error-handling
feat/17-request-validation
```

### Commit naming

Commit prefixes describe the individual change, not the overall branch:

```text
feat:
fix:
refactor:
test:
docs:
chore:
style:
```

A feature branch can therefore contain commits such as:

```text
feat: add centralized error middleware
refactor: forward controller errors to middleware
test: add authentication integration tests
fix: add missing next parameter
docs: document error handling architecture
```

### Pull request naming

The pull request describes the full issue:

```text
feat: implement centralized error handling
```

### Development preference

Use a coaching-style workflow:

- Work on one concept or bug at a time.
- Ask focused questions instead of immediately providing full solutions.
- Avoid large code dumps unless explicitly requested.
- Explain why architectural choices are made.
- Keep the tone energetic and encouraging.
- Write tests alongside new backend work.

---

## 4. Backend Architecture

### Request flow

```text
Client Request
→ Express Router
→ Authentication Middleware
→ Request Validation Middleware
→ Controller
→ Database Query Layer
→ PostgreSQL
```

### Error flow

```text
Database / Controller / Middleware Error
→ next(error)
→ Centralized Error Middleware
→ Consistent JSON response
```

### Layer responsibilities

#### Router

- Defines endpoint paths and HTTP methods.
- Applies middleware.
- Connects requests to controllers.

#### Middleware

- Authentication.
- Request validation.
- Future request logging.
- Centralized error response formatting.

#### Controller

- Coordinates request handling.
- Applies business logic.
- Translates expected database errors into application errors.
- Sends successful responses.
- Forwards unexpected errors with `next(err)`.

#### Database query layer

- Runs SQL.
- Returns query results.
- Usually allows errors to propagate naturally.
- Should not log and rethrow unless it adds meaningful context.
- Uses `try/catch` when cleanup, rollback, recovery, or translation is required.

#### PostgreSQL

- Final data-integrity layer through:
  - `NOT NULL`
  - `UNIQUE`
  - foreign keys
  - constraints
  - transactions

---

## 5. Application and Server Separation

The Express application was separated from process startup to support Supertest.

### `app.js`

Responsibilities:

- Create the Express application.
- Register middleware.
- Register routes.
- Register the catch-all 404 middleware.
- Register centralized error middleware.
- Export the application.

```text
app.js
→ builds and exports Express app
```

### `server.js`

Responsibilities:

- Import the application.
- Read the configured port.
- Call `app.listen()`.

```text
server.js
→ imports app
→ starts HTTP server
```

Tests import `app.js` directly without starting a network server.

---

## 6. Configuration Architecture

Configuration management was completed before centralized error handling.

### Environment files

```text
backend/.env
backend/.env.test
.env.example
```

Production does not load a local `.env` file. Production secrets will be supplied by AWS, Docker, or another hosting environment.

### Environment modes

```text
development
test
production
```

### Central configuration object

The backend exports one immutable configuration object:

```text
config.env
config.server.port
config.database.host
config.database.port
config.database.name
config.database.user
config.database.password
config.auth.jwtSecret
config.auth.jwtExpiresIn
config.client.url
```

### Required environment variables

```text
DB_HOST
DB_DATABASE
DB_USERNAME
DB_PASSWORD
JWT_SECRET
```

### Defaults

```text
PORT=3000
DB_PORT=5432
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

All direct `process.env` usage should flow through the centralized configuration module.

---

## 7. Authentication Architecture

### JWT structure

Tokens contain:

```json
{
  "user_id": 1
}
```

### Token creation

JWTs use:

```text
config.auth.jwtSecret
config.auth.jwtExpiresIn
```

### Protected routes

The authentication middleware reads:

```text
Authorization: Bearer <token>
```

It verifies the token and sets:

```text
req.user_id
```

### Authentication error behavior

```text
Valid token
→ request continues

Missing token
→ 401
→ "Not authorized, no token provided"

Invalid or expired token
→ 401
→ "Not authorized, token failed"
```

Authentication failures now use `UnauthorizedError` and flow through centralized error middleware.

The frontend’s automatic reload behavior for `401` responses was identified as imperfect but intentionally deferred. Backend correctness is the current priority.

---

## 8. Centralized Error Handling

Issue #16 was completed, merged, pulled, and the feature branch was deleted.

### Custom error hierarchy

```text
AppError
├── BadRequestError      400
├── UnauthorizedError    401
├── NotFoundError        404
└── ConflictError        409
```

`AppError` extends the native `Error` class and contains:

```text
message
name
statusCode
stack
```

Unexpected native `Error` instances become generic `500` responses.

### Error middleware behavior

Expected application error:

```json
{
  "message": "Program not found"
}
```

Unexpected error:

```json
{
  "message": "Internal server error"
}
```

Unexpected errors should eventually be logged once inside the centralized error middleware. Expected `4xx` errors should not generate noisy error logs.

### Controller pattern

Expected error:

```text
return next(new NotFoundError("Program not found"))
```

Unexpected error:

```text
catch (err) {
  return next(err)
}
```

Successful responses remain inside controllers.

---

## 9. Error Semantics Chosen

### `400 Bad Request`

Use for malformed or invalid request data.

Examples:

- Missing required fields.
- Incorrect field types.
- Invalid numeric ranges.
- Invalid nested payload structure.

### `401 Unauthorized`

Use for:

- Invalid login credentials.
- Missing JWT.
- Invalid JWT.
- Expired JWT.

Unknown email and incorrect password both return:

```text
401
"Invalid email or password"
```

This avoids revealing whether an account exists.

### `404 Not Found`

Use when a specific resource does not exist or is inaccessible to the authenticated user.

Examples:

```text
Program not found
Workout not found
User not found
```

Ownership failures use the same generic response as nonexistent resources.

### `409 Conflict`

Use for unique constraint conflicts.

Examples:

```text
Email already in use
Program name already in use
```

PostgreSQL error code `23505` is translated into `ConflictError`.

### Empty collections

An existing resource with no child resources returns `200`, not `404`.

Examples:

```json
{
  "message": "No workouts found for this program",
  "data": []
}
```

```json
{
  "message": "No exercises found for this workout",
  "data": []
}
```

A nonexistent parent resource returns `404`.

---

## 10. User Controller Status

The user controller has been refactored and tested.

### `loginUser`

Behavior:

```text
Valid credentials
→ 200
→ token and user data

Unknown email
→ 401
→ "Invalid email or password"

Incorrect password
→ 401
→ "Invalid email or password"

Unexpected error
→ centralized 500
```

### `signupUser`

Behavior:

```text
Valid signup
→ 201
→ token and created user data

Duplicate email
→ PostgreSQL 23505
→ ConflictError
→ 409
→ "Email already in use"

Unexpected error
→ centralized 500
```

### `getMe`

Behavior:

```text
Valid JWT + existing user
→ 200
→ user data

Valid JWT + nonexistent user_id
→ 404
→ "User not found"

Invalid JWT
→ authentication middleware
→ 401
```

---

## 11. Program Controller Status

The program controller has been refactored and integration-tested.

### `retrievePrograms`

Behavior:

```text
Authenticated user with programs
→ 200
→ data array

Authenticated user with no programs
→ 200
→ data: []
```

### `makeProgram`

Uses a PostgreSQL transaction:

```text
BEGIN
→ create program
→ compile workouts
→ create program-workout relationships
→ COMMIT
```

On failure:

```text
ROLLBACK
→ release client
```

Behavior:

```text
Valid program creation
→ 201
→ "Program creation successful"

Duplicate program name
→ PostgreSQL 23505
→ ConflictError
→ 409
→ "Program name already in use"

Unexpected error
→ centralized 500
```

### `removeProgram`

Behavior:

```text
Existing owned program
→ 200
→ "Program deleted"

Missing or unowned program
→ 404
→ "Program not found"
```

### `removeWorkout`

Removes a workout-program relationship.

Behavior:

```text
Existing relationship
→ 200
→ "Workout deleted from program"

Missing relationship
→ 404
→ "Workout not found in program"
```

### `getWorkouts`

The controller first verifies ownership using:

```text
programExistsForUser(program_id, user_id)
```

Behavior:

```text
Program missing or not owned by user
→ 404
→ "Program not found"

Program exists with workouts
→ 200
→ populated data array

Program exists with no workouts
→ 200
→ data: []
```

### `getExercises`

The controller verifies:

```text
programExistsForUser(program_id, user_id)
workoutExistsForProgram(workout_id, program_id)
```

Behavior:

```text
Program missing or unowned
→ 404
→ "Program not found"

Workout not linked to program
→ 404
→ "Workout not found"

Workout exists with exercises
→ 200
→ populated data array

Workout exists with no exercises
→ 200
→ data: []
```

---

## 12. Workout Controller Status

`workoutController.js` currently acts as an internal helper for `makeProgram`.

It handles:

```text
compileWorkout
→ create workout shell
→ find or create exercises
→ link exercises to workout
→ return workout IDs
```

Important helper functions:

```text
createExercise
createWorkoutShell
linkWorkoutExercises
compileWorkout
```

Direct helper tests were intentionally deferred because the `makeProgram` integration tests already exercise this flow.

An additional integration test was added or planned for a completely new exercise name to cover:

```text
Exercise does not exist
→ create custom user exercise
→ link it to workout
```

Many helper-level `try/catch` blocks only log and rethrow. These should eventually be cleaned up in a separate refactoring issue rather than expanding the request-validation issue.

---

## 13. Database Helper Functions Added

### `programExistsForUser`

Purpose:

```text
Does this program belong to this authenticated user?
```

Suggested SQL shape:

```sql
SELECT 1
FROM programs
WHERE program_id = $1
  AND user_id = $2;
```

Return:

```text
boolean
```

### `workoutExistsForProgram`

Purpose:

```text
Is this workout linked to this program?
```

Suggested SQL shape:

```sql
SELECT 1
FROM program_workouts
WHERE workout_id = $1
  AND program_id = $2;
```

Return:

```text
res.rowCount > 0
```

---

## 14. Testing Architecture

### Test style

Most tests are route-level integration tests using Supertest:

```text
HTTP request
→ router
→ middleware
→ controller
→ database
→ centralized error handler
→ HTTP response
```

### Test database

Tests use a separate PostgreSQL database configured through `.env.test`.

The test database may be safely truncated and reseeded.

### Test setup helper

`setupTestData()`:

- Truncates relevant tables.
- Resets identities.
- Seeds a user.
- Seeds a program.
- Seeds workouts.
- Seeds exercises.
- Seeds program-workout relationships.
- Seeds completed workout data.
- Uses a transaction.
- Rolls back on failure.
- Rethrows setup errors so Jest reports them.
- Does not run automatically when imported.

Test files call:

```text
beforeAll(async () => {
  await setupTestData()
})
```

### Database cleanup

Jest previously warned about open handles because the PostgreSQL pool stayed open.

Test files now close the pool:

```text
afterAll(async () => {
  await pool.end()
})
```

### Test file organization

Current or intended files:

```text
tests/userRoutes.test.js
tests/programRoutes.test.js
tests/errorMiddleware.test.js
```

The original `errorMiddleware.test.js` may still contain user integration tests. Renaming can happen later without blocking development.

### Coverage completed

#### Authentication and users

- Successful login.
- Unknown email.
- Wrong password.
- Successful signup.
- Duplicate email.
- Successful `getMe`.
- Valid token with nonexistent user.
- Missing token.
- Invalid token.

#### Programs

- Retrieve programs.
- Create program.
- Duplicate program name.
- Remove program.
- Program not found.
- Remove workout from program.
- Missing workout-program relationship.
- Retrieve workouts.
- Empty workout collection.
- Missing or unowned program.
- Retrieve exercises.
- Empty exercise collection.
- Program not owned by user.
- Workout not linked to program.

---

## 15. Request Validation — Current Issue

### Current branch

```text
feat/17-request-validation
```

The branch should be pushed before switching machines:

```bash
git status
git add .
git commit -m "chore: add Zod validation dependency"
git push -u origin feat/17-request-validation
```

On another machine:

```bash
git fetch origin
git switch feat/17-request-validation
cd backend
npm install
```

### Acceptance criteria

- Choose validation library: Zod, Joi, or express-validator.
- Add validation middleware pattern.
- Validate signup request body.
- Validate login request body.
- Validate workout/program creation inputs.
- Return consistent validation error responses.
- Add tests for invalid request bodies.
- Document validation approach.

### Validation library decision

**Zod was selected.**

Reasons:

- Strong support for nested objects and arrays.
- Reusable schemas.
- Clean separation from Express.
- Good fit for program → workouts → exercises payloads.
- Strong future TypeScript compatibility.
- Runtime validation remains necessary even after TypeScript migration.

Install from the backend directory:

```bash
npm install zod
```

Zod must be a normal production dependency because validation runs in the production server.

---

## 16. Validation Architecture Decision

The intended validation flow is:

```text
Request
→ route-specific Zod schema
→ reusable validation middleware
→ controller
→ database
```

Validation middleware should:

1. Receive a Zod schema.
2. Validate `req.body`, and later possibly `req.params` or `req.query`.
3. Pass validated data onward.
4. Convert validation failures into a consistent `400` response.
5. Use the centralized error-handler pipeline.

Conceptually:

```text
Invalid request
→ Zod validation fails
→ BadRequestError or validation-specific AppError
→ centralized error middleware
→ consistent 400 JSON response
```

Controllers should not repeat basic checks already guaranteed by schemas.

### Validation versus business logic

Validation answers:

```text
Is the input correctly shaped?
```

Examples:

- Is `email` a valid email string?
- Is `password` long enough?
- Is `workouts` an array?
- Is `target_sets` a positive integer?

Business logic answers:

```text
Is this operation allowed in the current application state?
```

Examples:

- Is the email already registered?
- Does the program belong to the user?
- Is the workout linked to this program?

Validation must not replace ownership or database checks.

---

## 17. Initial Schemas to Build

### Signup schema

Expected fields:

```text
f_name
l_name
email
password
```

Likely rules:

```text
f_name
- required
- string
- trimmed
- non-empty
- sensible maximum length

l_name
- required
- string
- trimmed
- non-empty
- sensible maximum length

email
- required
- string
- valid email
- normalized if appropriate

password
- required
- string
- minimum length
- sensible maximum length
```

### Login schema

Expected fields:

```text
email
password
```

Likely rules:

```text
email
- required
- valid email

password
- required
- non-empty string
```

The login schema should not necessarily enforce every signup password-strength rule because existing accounts may have been created under older rules.

### Program creation schema

Expected shape:

```text
name
description
workouts[]
```

Each workout contains:

```text
name
notes
exercises[]
```

Each exercise contains values such as:

```text
name
target_sets
target_reps
target_rest
target_weight
target_duration
distance
notes
time_flag
```

The schema should be composed:

```text
exerciseSchema
→ workoutSchema
→ programSchema
```

Likely rules include:

```text
Program name
- required
- non-empty string

Description
- optional or nullable string

Workouts
- array
- may be empty if empty programs are supported

Workout name
- required string

Exercises
- array
- may be empty if empty workouts are supported

Target sets/reps/rest
- numeric
- nonnegative or positive depending on semantics
```

---

## 18. Exact Next Steps

### Immediate next step

Confirm Zod is installed:

```bash
cd backend
npm install zod
```

Verify that `zod` appears under `dependencies` in:

```text
backend/package.json
```

Commit and push the dependency update before moving to another computer.

### After installation

Create a validation/schema directory. A likely structure is:

```text
backend/
├── validation/
│   ├── userSchemas.js
│   └── programSchemas.js
├── middleware/
│   └── validateRequest.js
```

Alternative naming is acceptable, but schemas and middleware should remain separate.

### First implementation target

Build the signup schema first.

Work through one field at a time:

1. `f_name`
2. `l_name`
3. `email`
4. `password`

Do not build login and program schemas simultaneously.

### Then build reusable middleware

The middleware should receive a schema and validate the request body.

Design questions to resolve:

- Use `safeParse()` or `parse()`.
- Whether validated/transformed data replaces `req.body`.
- Exact error response shape.
- Whether validation gets its own error class or uses `BadRequestError`.

Recommended response shape should be consistent and useful, for example:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

Do not expose raw implementation details unnecessarily.

### Apply signup validation

The signup route should become conceptually:

```text
POST /api/user/signup
→ validate signup body
→ signupUser
```

### Add tests

Initial invalid signup tests:

```text
missing first name → 400
missing last name → 400
missing email → 400
invalid email → 400
missing password → 400
short password → 400
valid body → 201
```

Also verify that rejected requests do not create database rows.

### Continue with login validation

Test:

```text
missing email → 400
invalid email → 400
missing password → 400
valid but incorrect credentials → 401
valid credentials → 200
```

This preserves the difference between malformed input and failed authentication.

### Continue with nested program validation

Test:

```text
missing program name → 400
workouts not an array → 400
workout missing name → 400
exercises not an array → 400
exercise missing name → 400
negative sets/reps/rest → 400
valid empty program → 201 if supported
valid nested program → 201
```

### Documentation

Update `docs/architecture.md` with:

```text
Request
→ authentication middleware
→ Zod validation middleware
→ controller
→ database
```

Add a section explaining:

- why backend validation is required;
- schema composition;
- consistent validation responses;
- separation between validation and business logic.

Update the README technical features with:

```text
Zod request validation
Reusable validation middleware
Nested program and workout validation
Jest and Supertest validation tests
```

---

## 19. Planned TypeScript Migration

A separate issue was created:

```text
Migrate backend incrementally to TypeScript
```

The TypeScript migration should happen after request validation is completed and merged.

### Why after validation

- Avoid mixing two major architectural changes.
- Zod schemas will migrate naturally to TypeScript.
- Existing tests provide a migration safety net.
- The backend is still small enough for incremental conversion.

### Migration approach

- Allow `.js` and `.ts` files to coexist.
- Preserve current API behavior.
- Preserve CommonJS initially.
- Do not combine TypeScript migration with an ES module migration.
- Convert incrementally.

### Suggested migration order

```text
1. TypeScript tooling and tsconfig
2. Custom error classes
3. Zod schemas
4. Validation middleware
5. Configuration
6. Authentication middleware
7. app.js and server.js
8. Controllers
9. Database query functions
10. Test helpers and tests
```

### TypeScript migration scope

Includes:

- Backend source files.
- Express request typing.
- Authenticated request type containing `user_id`.
- Database row and query return types.
- Zod-inferred request types.
- Build, development, and testing scripts.
- Documentation.

Excludes:

- Frontend migration.
- ES module conversion.
- API redesign.
- Database schema redesign.
- Unrelated feature development.

---

## 20. Important Deferred Work

The following items were deliberately deferred to avoid scope creep:

### Frontend unauthorized handling

The API service currently reloads on all `401` responses, which incorrectly treats failed login the same as an expired authenticated session.

Future fix:

```text
Failed login 401
→ display error
→ do not reload

Protected request 401
→ clear auth state
→ navigate to login
```

React routing decisions should remain in the React/auth layer, not the plain API service.

### Database/helper cleanup

Create a future issue to:

- remove redundant `try/catch` blocks that only log and rethrow;
- preserve transaction rollback logic;
- centralize unexpected error logging;
- avoid duplicate error logs.

### Logging

A future Sprint 2 issue will add request and error logging.

Likely goals:

- replace scattered `console.log` and `console.error`;
- add structured logging;
- log unexpected `500` errors once;
- include request context safely;
- avoid logging passwords, tokens, or secrets.

### TypeScript

Complete Issue #17 first, then begin the dedicated migration issue.

---

## 21. Current Status Summary

### Completed

- Project documentation and workflow setup.
- Configuration management.
- Immutable centralized configuration.
- Environment validation.
- Separate development and test databases.
- `app.js` / `server.js` separation.
- Custom application error classes.
- Centralized Express error middleware.
- Authentication error integration.
- User controller error refactor.
- Program controller error refactor.
- Ownership-aware program and workout checks.
- Jest and Supertest integration tests.
- Test database seeding and pool cleanup.
- Architecture and README updates.
- Issue #16 merged and branch deleted.
- TypeScript migration issue created.
- Request-validation branch created.
- Zod selected as the validation library.

### In progress

```text
Issue #17 — Request Validation
Branch: feat/17-request-validation
```

### Immediate action

```text
Install Zod
Commit dependency files
Push branch to GitHub
Pull branch on laptop
Create signup schema
```
