# Workout Tracker

Workout Tracker is a full-stack web application for creating workout programs, logging training sessions, and tracking long-term progress.

[![CI](https://github.com/jackdareid/WorkoutLogApp/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/jackdareid/WorkoutLogApp/actions/workflows/ci.yml)

## Project Status

WorkoutTracker is currently under active development. 

## Motivation

I created Workout Tracker because I wanted a platform I could use to create workout programs, log my sessions, and track my lifting progress.

## Quick Start

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

## Usage

User:

- Account creation
- Secure login
- Workout program creation
- Log completed workouts
- Workout history tracking
- Exercise organization

## Architecture

See [docs/architecture.md](docs/architecture.md)

## Contributing 

Thanks for your help! If you'd like to contribute, please fork the repository and open a pull request to the `main` branch. Please make sure that your code passes the existing tests and linting, and write tests to test your changes if necessary.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
