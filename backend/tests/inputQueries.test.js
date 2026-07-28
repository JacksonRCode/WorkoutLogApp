// // inputQueries.test.js
// const { setupTestData } = require("./testHelper.js");
// const {
//   createUser,
//   addProgramWorkout,
//   createCompletedSet,
//   createWorkoutExercises,
// } = require("../db/queries/inputQueries.js");
// const pool = require("../db/poolConnection.js");
//
// // General test formula:
// // 1. Create test with test description
// // 2. Use function in whatever stress testy way you need
// // 3.happy Make assertions about the info that will be returned
// // 3.unhappy Predict and catch error response
//
// // Use AAA formula: Arrange --> Act --> Assert
//
// // Global test specs
//
// // Reset db before each test
// beforeEach(async () => {
//   await setupTestData();
// });
//
// afterAll(async () => {
//   await pool.end();
// });
//
// describe("createUser", () => {
//   test("Should succeed in creating a user", async () => {
//     // Arrange
//     const f_name = "FirstName";
//     const l_name = "LastName";
//     const email = "email@email.com";
//     const password = "TestyPass";
//
//     // Act
//     const result = await createUser(f_name, l_name, email, password);
//
//     // Assert
//     expect(result).toBeDefined();
//     expect(result.f_name).toBe(f_name);
//     expect(result.l_name).toBe(l_name);
//     expect(result.email).toBe(email);
//   });
//
//   test("Should fail with duplicate email entry", async () => {
//     // Need this because if we don't hit an assertion then it's a fail
//     expect.assertions(1);
//     // Arrange
//     const f_name = "FirstName";
//     const l_name = "LastName";
//     const email = "dupe@dupe.com";
//     const password = "TestyPass";
//
//     // Act
//     await createUser(f_name, l_name, email, password);
//
//     // Assert
//     try {
//       await createUser(f_name, l_name, email, password);
//     } catch (err) {
//       expect(err.code).toBe("23505");
//     }
//   });
//
//   test("Shouldn't return a password.", async () => {
//     // Arrange
//     const f_name = "FirstName";
//     const l_name = "LastName";
//     const email = "email@email.com";
//     const password = "TestyPass";
//
//     // Act
//     const result = await createUser(f_name, l_name, email, password);
//
//     // Assert
//     expect(result.password_hash).toBeUndefined();
//     expect(result).not.toHaveProperty("password_hash");
//   });
// });
//
// describe("addProgramWorkout", () => {
//   test("Should link a workout to a program.", async () => {
//     // Arrange
//     const program_id = 1;
//     const workout_id = 1;
//
//     // Act
//     const result = await addProgramWorkout(program_id, workout_id);
//
//     // Assert
//     expect(result).toBeDefined();
//     expect(result.program_id).toBe(program_id);
//     expect(result.workout_id).toBe(workout_id);
//   });
//
//   test("Should fail: adding same workout to program twice.", async () => {
//     expect.assertions(1);
//
//     // Arrange
//     const program_id = 1;
//     const workout_id = 1;
//
//     // Act
//     await addProgramWorkout(program_id, workout_id);
//     try {
//       await addProgramWorkout(program_id, workout_id);
//     } catch (err) {
//       // Assert
//       expect(err.code).toBe("23505");
//     }
//   });
//
//   test("Should fail because program doesn't exist.", async () => {
//     // Arrange
//     const bad_id = 1000;
//
//     // Act / Assert
//     await expect(addProgramWorkout(bad_id, 1)).rejects.toMatchObject({
//       code: "23503",
//     });
//   });
// });
//
// describe("createWorkoutExercises", () => {
//   test("Should link an exercise to a workout.", async () => {
//     // Arrange
//     const exerciseData = {
//       exercise_id: 1,
//       workout_id: 1,
//       order_index: 1,
//       target_sets: 3,
//       target_reps: 12,
//       target_weight: 100,
//       target_duration: 0,
//       // Others have defaults
//     };
//
//     // Act
//     const result = await createWorkoutExercises(exerciseData);
//
//     // Assert
//     expect(result).toBeDefined();
//     expect(result.workout_id).toBe(1);
//     expect(result.exercise_id).toBe(1);
//     expect(result.order_index).toBe(1);
//     expect(result.time_flag).toBe(false);
//   });
//   test("Should fail: adding exercise to workout twice", async () => {
//     expect.assertions(1);
//     //Arrange
//     const exerciseData = {
//       exercise_id: 1,
//       workout_id: 1,
//       order_index: 1,
//       target_sets: 3,
//       target_reps: 12,
//       target_weight: 100,
//       target_duration: 0,
//       // Others have defaults
//     };
//
//     //Act
//     await createWorkoutExercises(exerciseData);
//     try {
//       await createWorkoutExercises(exerciseData);
//     } catch (err) {
//       //Assert
//       expect(err.code).toBe("23505");
//     }
//   });
// });
//
// describe("createCompletedSet", () => {
//   test("Should create completed set", async () => {
//     // Arrange
//     const exerciseData = {
//       completed_exercise_id: 1,
//       weight: 225,
//       reps: 10,
//       distance: 0,
//       duration: 0,
//       rpe: 7,
//       set_number: 2,
//     };
//
//     // Act
//     const result = await createCompletedSet(exerciseData);
//
//     // Assert
//     expect(result).toBeDefined();
//     expect(result.completed_exercise_id).toBe(1);
//     expect(result.rpe).toBe(7);
//   });
//   test("Should fail: Can't add completed set twice.", async () => {
//     expect.assertions(1);
//     // Arrange
//     const exerciseData = {
//       completed_exercise_id: 1,
//       weight: 225,
//       reps: 10,
//       distance: 0,
//       duration: 0,
//       rpe: 7,
//       set_number: 2,
//     };
//
//     // Act
//     await createCompletedSet(exerciseData);
//     try {
//       await createCompletedSet(exerciseData);
//     } catch (err) {
//       expect(err.code).toBe("23505");
//     }
//   });
// });
