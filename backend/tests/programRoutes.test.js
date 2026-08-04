const request = require("supertest");
import { app } from "../app";
const { setupTestData, endTesting } = require("./testHelper");

beforeAll(async () => {
  await setupTestData();
});

// Test structure:
// 1. Arrange: Choose invalid credentials
// 2. Act: Send request
// 4. Assert: expect certain outcome

const getToken = async () => {
  const loginRequest = await request(app).post("/api/user/login").send({
    email: "test@example.com",
    password: "password123",
  });
  return loginRequest.body.token;
};

// retrieveProgram
it("returns status code 200 on successful retrieval", async () => {
  const token = await getToken();
  const response = await request(app)
    .get("/api/programs/")
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body.data)).toBe(true);
});

it("returns status code 500 on failed retrieval", async () => {});

// makeProgram
it("returns status code 201 on successful program creation", async () => {
  const exercise1 = {
    name: "Bench Press",
    target_sets: 3,
    target_reps: 8,
    target_rest: 90,
  };
  const exercise2 = {
    name: "Pull ups",
    target_sets: 3,
    target_reps: 8,
    target_rest: 90,
  };
  const exercise3 = {
    name: "Squat",
    target_sets: 3,
    target_reps: 8,
    target_rest: 90,
  };

  const token = await getToken();

  const workout1 = {
    name: "Test Workout1",
    notes: "Test workout notes",
    exercises: [exercise1],
  };
  const workout2 = {
    name: "Test Workout2",
    notes: "Test workout notes",
    exercises: [exercise2],
  };
  const workout3 = {
    name: "Test Workout2",
    notes: "Test workout notes",
    exercises: [exercise3],
  };
  const workouts = [workout1, workout2, workout3];

  const response = await request(app)
    .post("/api/programs/create")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Another Test Program",
      description: "This is a test program",
      workouts,
    });
  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});
it("returns status code 201 on successful program creation, even with new exercise", async () => {
  const exercise1 = {
    name: "Hack Squat",
    target_sets: 3,
    target_reps: 8,
    target_rest: 90,
  };

  const token = await getToken();

  const workout1 = {
    name: "Test Workout9",
    notes: "Test workout notes",
    exercises: [exercise1],
  };
  const workouts = [workout1];

  const response = await request(app)
    .post("/api/programs/create")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Yet Another Test Program",
      description: "This is a test program",
      workouts,
    });
  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});
it("returns status code 409 when creating a program with a duplicate name for a user", async () => {
  const exercise1 = {
    name: "Bench Press",
    target_sets: 3,
    target_reps: 8,
    target_rest: 90,
  };

  const token = await getToken();

  const workout1 = {
    name: "Test Workout2",
    notes: "Test workout notes",
    exercises: [exercise1],
  };
  const workouts = [workout1];

  const response = await request(app)
    .post("/api/programs/create")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Another Test Program",
      description: "This is a test program",
      workouts,
    });
  expect(response.status).toBe(409);
  expect(response.body.message).toBe("Program name already in use");
});

// removeProgram
it("returns status code 200 when a program is successfully deleted", async () => {
  const token = await getToken();

  const response = await request(app)
    .delete(`/api/programs/${1}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Program deleted");
});
it("returns status code 404 when a program isn't found to be deleted", async () => {
  const token = await getToken();

  const response = await request(app)
    .delete(`/api/programs/${1}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Program not found");
});

// removeWorkout
it("returns status code 200 when a workout is removed successfully", async () => {
  const token = await getToken();
  const response = await request(app)
    .delete(`/api/programs/${2}/workouts/${2}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Workout deleted from program");
});

it("returns status code 404 when workout isn't found", async () => {
  const token = await getToken();
  const response = await request(app)
    .delete(`/api/programs/${2}/workouts/${0}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Workout not found in program");
});

// getWorkouts
it("returns status code 200 when workouts are successfully retrieved", async () => {
  const token = await getToken();
  const response = await request(app)
    .get(`/api/programs/${2}/workouts`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Workouts successfully retrieved");
});
it("returns status code 200 when there aren't workouts in a program", async () => {
  const token = await getToken();
  const createEmptyProgram = await request(app)
    .post("/api/programs/create")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Empty Test Program",
      description: "This is an empty test program",
      workouts: [],
    });
  const { program_id } = createEmptyProgram.body.data;
  const response = await request(app)
    .get(`/api/programs/${program_id}/workouts`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("No workouts found for this program");
});
it("returns status code 404 when program doesn't exist for user", async () => {
  const token = await getToken();
  const response = await request(app)
    .get(`/api/programs/${999}/workouts`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Program not found");
});

// getExercises
it("returns status code 200 when exercises successfully retrieved", async () => {
  const token = await getToken();
  const response = await request(app)
    .get(`/api/programs/${2}/workouts/${4}`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Exercises successfully retrieved");
});
it("returns 404 when program doesn't belong to user", async () => {
  const token = await getToken();
  const response = await request(app)
    .get(`/api/programs/${0}/workouts/${2}`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Program not found");
});
it("returns 404 when workout doesn't belong to program", async () => {
  const token = await getToken();
  const response = await request(app)
    .get(`/api/programs/${2}/workouts/${0}`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Workout not found");
});

afterAll(async () => {
  await endTesting();
});
