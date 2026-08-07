# WorkoutLogApp Roadmap

## Current Foundation

### Completed

- Project README and architecture documentation
- Environment configuration
- Centralized error handling
- Request validation with Zod
- Backend migration to TypeScript
- Typed database queries, controllers, middleware, and tests
- Integration tests for authentication, programs, and validation

## Phase 1: Production Guardrails

### 1. Structured Request Logging

- Add Pino and HTTP request logging
- Include request method, route, status code, response time, and request ID
- Redact passwords, authorization headers, tokens, and other sensitive values
- Use environment-appropriate formatting
- Log unexpected errors without changing API responses
- Add focused tests for logging configuration where valuable

### 2. Continuous Integration

- Add a GitHub Actions pull-request workflow
- Install dependencies with `npm ci`
- Run formatting or lint checks
- Run TypeScript type checking
- Run Jest integration tests
- Run the production build
- Protect the main branch from failing checks

**Demonstrates:** automated quality control, GitHub workflows, reliable team practices.

## Phase 2: Complete the Core Product

Build one complete vertical slice before adding more infrastructure.

### 3. Workout Session API

- Define the difference between a workout template and a completed workout session
- Add Zod schemas and inferred types for completed workouts, exercises, and sets
- Add authenticated endpoints to start, finish, and retrieve workout sessions
- Save completed workouts, exercises, and sets transactionally
- Verify that users can only access their own workouts and history
- Return consistent status codes and response shapes
- Add integration tests for success, validation, authorization, and rollback behavior

**Demonstrates:** API design, relational data modeling, transactions, authorization, testing.

### 4. Workout Tracking Interface

- Allow a user to select a program and workout
- Build a mobile-friendly active-workout screen
- Display exercise targets and previous performance
- Allow completed sets to be added, edited, and removed
- Record applicable reps, weight, time, distance, rest, and RPE
- Handle loading, empty, validation, unauthorized, and server-error states
- Finish or abandon a workout intentionally
- Prevent obvious accidental data loss

When practical, write new frontend code in TypeScript and migrate nearby JavaScript incrementally instead of pausing for a full rewrite.

**Demonstrates:** React state management, TypeScript, responsive UI, API integration, UX judgment.

### 5. Workout History

- Display completed workout sessions
- Show exercises and completed sets for each session
- Show the most recent performance while starting the next workout
- Add useful empty states and navigation
- Add focused component and integration tests

**Milestone:** A user can create a workout, complete it, save results, and view them later.

## Phase 3: Reproducible Deployment

### 6. Dockerization

- Dockerize the backend with a production build
- Dockerize the frontend
- Add Docker Compose for the application and PostgreSQL
- Add container health checks
- Document local container setup
- Keep secrets out of images and source control

**Demonstrates:** containers, reproducible environments, production builds, configuration management.

### 7. AWS Staging Deployment

- Choose and document a deliberately simple AWS architecture
- Deploy the frontend and backend
- Configure a managed PostgreSQL database
- Configure production environment variables and secrets
- Add HTTPS, domain configuration, and health checks
- Add database migration and seed procedures
- Set a budget and billing alerts before provisioning resources

**Demonstrates:** cloud deployment, networking, managed databases, security, operational awareness.

### 8. Continuous Deployment

- Deploy only after CI succeeds on the main branch
- Build and publish versioned application artifacts or images
- Automate the staging deployment
- Add a rollback procedure
- Document how releases are verified

**Demonstrates:** CI/CD, release management, automation, operational reliability.

## Phase 4: Portfolio-Ready Quality

### 9. Authentication and Security Improvements

- Add request rate limiting, especially for authentication routes
- Add secure HTTP headers
- Review CORS configuration
- Review authorization on every resource route
- Decide whether refresh tokens, password reset, and email verification are justified
- Document the threat model and security trade-offs

### 10. API and End-to-End Documentation

- Add OpenAPI documentation for the demonstrated API surface
- Add one browser-level end-to-end test for the primary user journey
- Add an architecture diagram showing request, application, and deployment flow
- Document important technical decisions and trade-offs

### 11. Portfolio Presentation

- Add screenshots or a short demo video
- Provide demo credentials or a safe seeded demo flow
- Make local setup reproducible from a clean clone
- Rewrite README sections around the problem, architecture, testing, and results
- Add a live application link and API health link
- Prepare concise resume bullets with measurable scope
- Prepare interview stories about TypeScript migration, transactions, validation, testing, debugging, and deployment

**Milestone:** A recruiter or engineer can understand, run, test, and evaluate the project without assistance.

## Parallel Job-Search Track

Do not wait for every phase to be complete before applying.

- Begin applying once Phase 1 is complete
- Update the resume and portfolio after every major milestone
- Make regular, targeted applications each week
- Practice explaining one project decision without notes each week
- Practice JavaScript, TypeScript, SQL, HTTP, React, and testing fundamentals
- Use interviews and job descriptions to adjust the roadmap based on recurring skill gaps

## Deliberately Deferred

These are useful only after the core product and deployment are working:

- AI-generated workout programming
- Redis caching
- Advanced workout analytics
- Microservices
- Kubernetes
- Multiple deployment environments
- Complex event or message systems
- Premature performance optimization

<!--
Previous roadmap retained for historical reference.

# WorkoutLogApp Roadmap

## Sprint 1: Project Foundation

### Done

- Improve README
- Add architecture documentation
- Add `.env.example`
- Establish project documentation structure

## Sprint 2: Backend Production Readiness

- Centralized error handling

- Migration to TypeScript
- Request logging
- Improved validation
- Authentication improvements

## Sprint 3: Dockerization

- Dockerize backend
- Dockerize frontend
- Add Docker Compose
- Run PostgreSQL locally through containers

## Sprint 4: AWS Deployment

- Deploy backend
- Deploy frontend
- Configure production database
- Add HTTPS and environment variables

## Sprint 5: CI/CD

- Add GitHub Actions
- Run tests automatically
- Automate deployment workflow

## Future Improvements

- Refresh token authentication
- Password reset
- Email verification
- Redis caching
- Workout analytics
- API documentation with Swagger/OpenAPI
  -->
