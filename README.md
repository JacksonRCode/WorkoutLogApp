# WorkoutTracker

WorkoutTracker is a full-stack web application for creating workout programs, logging training sessions, and tracking long-term progress. It was built to demonstrate modern software engineering principles including RESTful API development, JWT authentication, PostgreSQL database design, and scalable application architecture.

This project serves both as a practical fitness application and as a long-term exploration of modern software engineering practices, with a focus on scalable backend development and production-ready architecture.

---

| Status         | Active Development  |
| -------------- | ------------------- |
| Frontend       | React               |
| Backend        | Express, TypeScript |
| Database       | PostgreSQL          |
| Authentication | JWT                 |
| Deployment     | Planned (AWS)       |
| License        | MIT                 |

---

## Project Status

Active Development

WorkoutTracker is currently under active development. The current release includes user authentication, workout program management, and workout tracking. Upcoming milestones include Docker support, AWS deployment, CI/CD, refresh token authentication, and performance improvements.

---

## Why this project?

I created WorkoutTracker as a long-term engineering project focused on applying production-ready backend development practices. This project will continuously evolve to incorporate technologies such as Docker, AWS, CI/CD, Redis, and automated testing while maintaining clean, maintainable architecture.

---

## Features

User:

- Account creation
- Secure login
- Workout program creation
- Log completed workouts
- Workout history tracking
- Exercise organization

Technical:

- JWT authentication
- RESTful API architecture
- PostgreSQL relational database
- Input validation
- Protected API routes
- Centralized Express error handling with custom error classes
- Jest and Supertest integration testing
- Separate development and test database configuration
- Zod request validation with reusable middleware
- Strict TypeScript across backend source and integration tests
- Typed Express requests, authenticated requests, and route parameters
- Typed PostgreSQL query inputs and result rows

---

## Tech Stack

**Frontend**

- React

**Backend**

- Node.js
- Express
- TypeScript

Database

- PostgreSQL

Authentication

- JWT

Validation

- Zod

Testing

- Jest
- Supertest
- Babel

Development

- Git

---

## Architecture

See [docs/architecture.md](docs/architecture.md)

React Frontend
│
REST API (Express)
│
PostgreSQL

---

## Screenshots

Screenshots will be added as the user interface develops.

---

## Getting Started

**Note**

The application currently requires a locally hosted PostgreSQL database.
Docker support and deployment are planned in a future release.

1. Clone the repository

```bash
git clone git@github.com:jackdareid/WorkoutLogApp.git
cd WorkoutLogApp
```

2. Install requirements

```bash
cd client
npm install

cd ../backend
npm install
```

3. Copy `.env.example` to `.env` inside the `backend/` directory

Integration tests use `backend/.env.test` and should point to a separate PostgreSQL test database.

4. Set up servers

Open two terminals

Terminal one:

```bash
cd client
npm run dev
```

Terminal two:

```bash
cd backend
npm run dev
```

5. Visit website
   http://localhost:5173/

---

## Backend TypeScript Workflow

The backend is written in strict TypeScript and compiled to CommonJS JavaScript in `backend/dist/`.

Run backend commands from `backend/`:

| Command                  | Purpose                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| `npm run dev`            | Run `server.ts` with `tsx` and restart on source changes                    |
| `npm run typecheck`      | Typecheck production source without emitting files                          |
| `npm run typecheck:test` | Typecheck source and Jest integration tests without emitting files          |
| `npm test`               | Transform TypeScript with Babel and execute Jest/Supertest tests            |
| `npm run build`          | Compile production source into `dist/`                                      |
| `npm start`              | Run the compiled production entry point, `dist/server.js`                   |
| `npm run verify`         | Run source typechecking, test typechecking, tests, and the production build |

Development uses `tsx`, so a manual build is not required before `npm run dev`. Production uses compiled files and expects environment variables to be supplied by the hosting environment; it does not require `.env` files inside `dist/`.

TypeScript provides compile-time guarantees, while Zod validates untrusted request data at runtime. Controllers consume Zod-inferred validated body types, authentication augments Express requests with an optional `user_id`, and database queries define typed parameters and result rows.

---

## Roadmap

See [docs/roadmap.md](docs/roadmap.md)

---

## Future Improvements

#### Product

- AI coaching
- Powerlifting analytics
- Coach dashboard

#### Engineering

- Docker
- Docker Compose
- AWS
- CI/CD
- Refresh Token Authentication
- Redis Caching
- OpenAPI Documentation
- GitHub actions

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
