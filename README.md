# WorkoutTracker

WorkoutTracker is a full-stack web application for creating workout programs, logging training sessions, and tracking long-term progress. It was built to demonstrate modern software engineering principles including RESTful API development, JWT authentication, PostgreSQL database design, and scalable application architecture.

This project serves both as a practical fitness application and as a long-term exploration of modern software engineering practices, with a focus on scalable backend development and production-ready architecture.

---

| Status         | Active Development |
| -------------- | ------------------ |
| Frontend       | React              |
| Backend        | Express            |
| Database       | PostgreSQL         |
| Authentication | JWT                |
| Deployment     | Planned (AWS)      |
| License        | MIT                |

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

---

## Tech Stack

**Frontend**

- React

**Backend**

- Node.js
- Express

Database

- PostgreSQL

Authentication

- JWT

Validation

- Zod

Testing

- Jest
- Supertest

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
