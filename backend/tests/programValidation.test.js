const request = require("supertest");
const app = require("../app");
const { setupTestData, endTesting } = require("./testHelper");

const PATH = "/api/programs/create";
let token;

beforeAll(async () => {
  await setupTestData();

  const loginResponse = await request(app).post("/api/user/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = loginResponse.body.token;
});

const makeRequest = (data) => {
  return request(app)
    .post(PATH)
    .set("Authorization", `Bearer ${token}`)
    .send(data);
};

const validProgram = () => ({
  name: "ProgramName",
  description: "Test description",
  workouts: [
    {
      name: "Valid Workout",
      notes: "Test notes",
      exercises: [
        {
          name: "Bench Press",
          target_sets: 3,
          target_reps: 10,
          target_rest: 90,
        },
      ],
    },
  ],
});

// happy paths
it("returns 201 for program creation without workouts", async () => {
  const data = {
    name: "TestName1",
    description: "Test description",
    workouts: [],
  };

  const response = await makeRequest(data);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});

it("returns 201 for program creation", async () => {
  const data = validProgram();
  data.name = "TestName2";

  const response = await makeRequest(data);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});

it("returns 201 when workouts property is omitted", async () => {
  const data = {
    name: "TestName3",
    description: "Test description",
  };

  const response = await makeRequest(data);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});

it("returns 201 when target_rest is omitted and defaults to 60", async () => {
  const data = {
    name: "TestName4",
    description: "Test description",
    workouts: [
      {
        name: "Workout 1",
        notes: "Notes for workout 1",
        exercises: [
          {
            name: "Bench Press",
            target_sets: 3,
            target_reps: 10,
          },
        ],
      },
    ],
  };

  const creationResponse = await makeRequest(data);
  expect(creationResponse.status).toBe(201);

  const programId = creationResponse.body.data.program_id;
  const workoutResponse = await request(app)
    .get(`/api/programs/${programId}/workouts`)
    .set("Authorization", `Bearer ${token}`);
  expect(workoutResponse.status).toBe(200);

  const workoutId = workoutResponse.body.data[0].workout_id;

  const exerciseResponse = await request(app)
    .get(`/api/programs/${programId}/workouts/${workoutId}`)
    .set("Authorization", `Bearer ${token}`);
  expect(exerciseResponse.status).toBe(200);

  const targetRest = exerciseResponse.body.data[0].rest;
  expect(targetRest).toBe(60);
});

it("returns 201 when target_sets is omitted", async () => {
  const data = {
    name: "TestName5",
    description: "Test description",
    workouts: [
      {
        name: "Workout 1",
        notes: "Notes for workout 1",
        exercises: [
          {
            name: "Bench Press",
            target_reps: 10,
            target_rest: 90,
          },
        ],
      },
    ],
  };

  const response = await makeRequest(data);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});
it("returns 201 when target_reps is omitted", async () => {
  const data = {
    name: "TestName6",
    description: "Test description",
    workouts: [
      {
        name: "Workout 1",
        notes: "Notes for workout 1",
        exercises: [
          {
            name: "Bench Press",
            target_sets: 3,
            target_rest: 90,
          },
        ],
      },
    ],
  };

  const response = await makeRequest(data);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});

it("returns 201 for program with exercise with zero sets", async () => {
  const data = {
    name: "TestName7",
    description: "Test description",
    workouts: [
      {
        name: "Workout 1",
        notes: "Notes for workout 1",
        exercises: [
          {
            name: "Bench Press",
            target_sets: 0,
            target_reps: 3,
            target_rest: 90,
          },
        ],
      },
    ],
  };

  const response = await makeRequest(data);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});

it("returns 201 for program with exercise with zero reps", async () => {
  const data = {
    name: "TestName8",
    description: "Test description",
    workouts: [
      {
        name: "Workout 1",
        notes: "Notes for workout 1",
        exercises: [
          {
            name: "Bench Press",
            target_sets: 3,
            target_reps: 0,
            target_rest: 90,
          },
        ],
      },
    ],
  };

  const response = await makeRequest(data);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("Program creation successful");
});

// // sad paths
it("returns 400 for missing program name", async () => {
  const data = validProgram();
  delete data.name;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "name",
    message: "Program name is required",
  });
});

it("returns 400 for empty program name", async () => {
  const data = validProgram();
  data.name = "";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "name",
    message: "Program name is required",
  });
});

it("returns 400 for whitespace program name", async () => {
  const data = validProgram();
  data.name = "   ";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "name",
    message: "Program name is required",
  });
});

it("returns 400 when program name is not a string", async () => {
  const data = validProgram();
  data.name = 45335;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
  expect(response.body.errors).toContainEqual({
    field: "name",
    message: "Program name must be a string",
  });
});

it("returns 400 when exercise name is not a string", async () => {
  const data = validProgram();
  data.name = "NonStringExerciseName";
  data.workouts[0].exercises[0].name = 54354;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.name",
    message: "Exercise name must be a string",
  });
});

it("returns 400 when workouts isn't an array", async () => {
  const data = validProgram();
  data.name = "NonArrayWorkouts";
  data.workouts = 3424;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts",
    message: "Workouts must be an array",
  });
});

it("returns 400 for missing workout name", async () => {
  const data = validProgram();
  data.name = "MissingWorkoutName";
  delete data.workouts[0].name;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.name",
    message: "Workout name is required",
  });
});

it("returns 400 for empty workout name", async () => {
  const data = validProgram();
  data.name = "EmptyWorkoutName";
  data.workouts[0].name = "";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.name",
    message: "Workout name is required",
  });
});

it("returns 400 for whitespace workout name", async () => {
  const data = validProgram();
  data.name = "WhitespaceWorkoutName";
  data.workouts[0].name = "   ";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.name",
    message: "Workout name is required",
  });
});

it("returns 400 for non-string workout name", async () => {
  const data = validProgram();
  data.name = "NonSpaceWorkoutName";
  data.workouts[0].name = 54355;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.name",
    message: "Workout name must be a string",
  });
});

it("returns 400 when exercises isn't an array", async () => {
  const data = validProgram();
  data.name = "NonArrayExercises";
  data.workouts[0].exercises = 54354;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises",
    message: "Exercises must be an array",
  });
});

it("returns 400 for missing exercises", async () => {
  const data = validProgram();
  data.name = "Missing Exercises";
  delete data.workouts[0].exercises;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises",
    message: "Exercises are required",
  });
});

it("returns 400 for empty exercise array", async () => {
  const data = validProgram();
  data.name = "Empty Exercises";
  data.workouts[0].exercises = [];

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises",
    message: "Workout must contain at least one exercise",
  });
});

it("returns 400 for missing exercise name", async () => {
  const data = validProgram();
  data.name = "MissingExerciseName";
  delete data.workouts[0].exercises[0].name;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.name",
    message: "Exercise name is required",
  });
});

it("returns 400 for empty exercise name", async () => {
  const data = validProgram();
  data.name = "Empty exercise name";
  data.workouts[0].exercises[0].name = "";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.name",
    message: "Exercise name is required",
  });
});

it("returns 400 for whitespace exercise name", async () => {
  const data = validProgram();
  data.name = "Whitespace exercise name";
  data.workouts[0].exercises[0].name = "   ";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.name",
    message: "Exercise name is required",
  });
});

it("returns 400 for negative sets", async () => {
  const data = validProgram();
  data.name = "Negative sets";
  data.workouts[0].exercises[0].target_sets = -10;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.target_sets",
    message: "Target sets cannot be negative",
  });
});

it("returns 400 for negative reps", async () => {
  const data = validProgram();
  data.name = "Negative reps";
  data.workouts[0].exercises[0].target_reps = -10;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.target_reps",
    message: "Target reps cannot be negative",
  });
});

it("returns 400 for negative rest", async () => {
  const data = validProgram();
  data.name = "Negative rest";
  data.workouts[0].exercises[0].target_rest = -10;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.target_rest",
    message: "Target rest cannot be negative",
  });
});

it("returns 400 when sets is not a number", async () => {
  const data = validProgram();
  data.name = "Non-number sets";
  data.workouts[0].exercises[0].target_sets = "Hey there";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.target_sets",
    message: "Target sets must be a number",
  });
});

it("returns 400 when reps is not a number", async () => {
  const data = validProgram();
  data.name = "Non-number reps";
  data.workouts[0].exercises[0].target_reps = "Hey there";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.target_reps",
    message: "Target reps must be a number",
  });
});

it("returns 400 when rest is not a number", async () => {
  const data = validProgram();
  data.name = "Non-number rest";
  data.workouts[0].exercises[0].target_rest = "Hey there";

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    field: "workouts.0.exercises.0.target_rest",
    message: "Target rest must be a number",
  });
});

it("returns all errors with correct nested field paths", async () => {
  const data = validProgram();
  data.name = "";
  data.workouts[0].name = "";
  data.workouts[0].exercises[0].name = "";
  data.workouts[0].exercises[0].target_sets = -1;

  const response = await makeRequest(data);

  expect(response.status).toBe(400);
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      { field: "name", message: "Program name is required" },
      {
        field: "workouts.0.name",
        message: "Workout name is required",
      },
      {
        field: "workouts.0.exercises.0.name",
        message: "Exercise name is required",
      },
      {
        field: "workouts.0.exercises.0.target_sets",
        message: "Target sets cannot be negative",
      },
    ]),
  );
});

afterAll(async () => {
  await endTesting();
});
