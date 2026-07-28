# WorkoutLogApp Architecture

## Overview

WorkoutLogApp is a full-stack workout tracking platform with a React frontend, Express backend, and PostgreSQL database.

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
              Express Server
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
User submits login credentials
  |
  v
Backend validates credentials
  |
  v
Backend signs JWT with 24h expiration
  |
  v
Frontend stores token
  |
  v
Frontend sends token in Authorization header
  |
  v
Protected backend routes validate token
```

---

## Error Handling

- Controllers forward errors using `next(error)`.
- Expected application errors use custom AppError subclasses.
- Supported errors currently include 400, 401, 404, and 409
- Unexpected errors return a generic 500 response

---

## Key Design Decisions

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
