import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService";

function CreateProgramPage() {
  const navigate = useNavigate();

  const [programData, setProgramData] = useState({
    name: "",
    description: "",
    workouts: [{ name: "Day 1", notes: "", exercises: [] }],
  });

  const handleAddWorkout = () => {
    setProgramData({
      ...programData,
      workouts: [
        ...programData.workouts,
        {
          name: `Day ${programData.workouts.length + 1}`,
          notes: "",
          exercises: [],
        },
      ],
    });
  };

  const handleWorkoutChange = (index, field, value) => {
    const updatedWorkouts = [...programData.workouts];
    updatedWorkouts[index] = {
      ...updatedWorkouts[index],
      [field]: value,
    };
    setProgramData({ ...programData, workouts: updatedWorkouts });
  };

  const handleRemoveWorkout = (index) => {
    const updatedWorkouts = programData.workouts.filter((_, i) => i !== index);
    setProgramData({ ...programData, workouts: updatedWorkouts });
  };

  // Add empty exercise to a workout
  const handleAddExercise = (workoutIndex) => {
    const updatedWorkouts = [...programData.workouts];
    updatedWorkouts[workoutIndex] = {
      ...updatedWorkouts[workoutIndex],
      exercises: [
        ...updatedWorkouts[workoutIndex].exercises,
        { name: "", target_sets: 3, target_reps: 10, target_rest: 90 },
      ],
    };
    setProgramData({ ...programData, workouts: updatedWorkouts });
  };

  const handleExerciseChange = (workoutIndex, exerciseIndex, field, value) => {
    const updatedWorkouts = [...programData.workouts];
    const updatedExercises = [...updatedWorkouts[workoutIndex].exercises];

    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      [field]: value,
    };

    updatedWorkouts[workoutIndex] = {
      ...updatedWorkouts[workoutIndex],
      exercises: updatedExercises,
    };

    setProgramData({ ...programData, workouts: updatedWorkouts });
  };

  const handleRemoveExercise = (workoutIndex, exerciseIndex) => {
    const updatedWorkouts = [...programData.workouts];
    const updatedExercises = updatedWorkouts[workoutIndex].exercises.filter(
      (_, i) => i !== exerciseIndex,
    );

    updatedWorkouts[workoutIndex] = {
      ...updatedWorkouts[workoutIndex],
      exercises: updatedExercises,
    };

    setProgramData({ ...programData, workouts: updatedWorkouts });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await apiService.createProgram(programData);
      console.log("Submitting program payload: ", programData);
      alert("Program compiled and saved!");

      navigate("/programs");
    } catch (err) {
      console.error("Failed to build program:", err.message);
    }
  };

  return (
    <div style={{ maxWidth: "750px", margin: "0 auto", padding: "10px" }}>
      {/* Upper Navigation Anchor */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/programs"
          style={{
            color: "#6c757d",
            textDecoration: "none",
            fontWeight: "600",
            border: "1px solid black",
          }}
        >
          Cancel and Return to Programs
        </Link>
      </div>
      <h2>Design Your Workout Routine</h2>
      <p style={{ color: "#555" }}>
        Define your training split, schedule days, and configure exercise set
        schemes.
      </p>

      <form onSubmit={handleSave}>
        {/* Core Metadata Segment */}
        <div style={{ marginBottom: "25px" }}>
          <input
            type="text"
            placeholder="Program Name (e.g., Push/Pull/Legs, Upper/Lower)"
            value={programData.name}
            onChange={(e) =>
              setProgramData({ ...programData, name: e.target.value })
            }
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            required
          />
        </div>

        {/* Program Description */}
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#4a5568",
            }}
          >
            Description / Notes
          </label>
          <textarea
            placeholder="What is the focus of this program? (e.g., 8-week hypertrophy block targeting progressive overload on compound lifts)"
            value={programData.description}
            onChange={(e) =>
              setProgramData({ ...programData, description: e.target.value })
            }
            rows="3"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "15px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
              resize: "vertical", // Allows the user to expand it vertically if they type a lot
              fontFamily: "inherit", // Ensures it matches the font of your inputs
            }}
          />
        </div>

        {/* Workout Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {programData.workouts.map((workout, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                position: "relative",
              }}
            >
              {/* Delete workout from program button */}
              {programData.workouts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveWorkout(index)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontSize: "12px",
                  }}
                >
                  Remove Day
                </button>
              )}

              <h4 style={{ margin: "0 0 15px 0", color: "#4a5568" }}>
                Configure Workout #{index + 1}
              </h4>

              <div
                style={{ display: "flex", gap: "15px", marginBottom: "15px" }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Day Name (e.g. Push Day, Upper Split)"
                    value={workout.name}
                    onChange={(e) =>
                      handleWorkoutChange(index, "name", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                    }}
                    required
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <input
                    type="text"
                    placeholder="Optional focus notes (e.g., Focus on chest width and triceps)"
                    value={workout.notes}
                    onChange={(e) =>
                      handleWorkoutChange(index, "notes", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </div>
              </div>

              {/* Workout Exercise Section */}
              <div style={{ marginTop: "20px" }}>
                <h5
                  style={{
                    margin: "0 0 10px 0",
                    color: "#4a5568",
                    fontSize: "15px",
                  }}
                >
                  Exercises for this day
                </h5>

                {workout.exercises.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "15px",
                    }}
                  >
                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div
                        key={exerciseIndex}
                        style={{
                          display: "flex",
                          gap: "15px",
                          alignItems: "flex-end", // Aligns items to the bottom so fields look balanced with labels
                          backgroundColor: "#ffffff",
                          padding: "15px",
                          borderRadius: "4px",
                          border: "1px solid #e2e8f0",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Exercise Name Selection */}
                        <div style={{ flex: 3, minWidth: "180px" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#64748b",
                              marginBottom: "4px",
                            }}
                          >
                            Exercise Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Barbell Squat"
                            value={exercise.name}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                exerciseIndex,
                                "name",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #cbd5e1",
                              boxSizing: "border-box",
                            }}
                            required
                          />
                        </div>

                        {/* Sets Input Box */}
                        <div style={{ flex: 1, minWidth: "70px" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#64748b",
                              marginBottom: "4px",
                              textAlign: "center",
                            }}
                          >
                            Sets
                          </label>
                          <input
                            type="number"
                            placeholder="3"
                            value={exercise.target_sets || ""}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                exerciseIndex,
                                "target_sets",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #cbd5e1",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                            min="1"
                            required
                          />
                        </div>

                        {/* Reps Input Box */}
                        <div style={{ flex: 1, minWidth: "70px" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#64748b",
                              marginBottom: "4px",
                              textAlign: "center",
                            }}
                          >
                            Reps
                          </label>
                          <input
                            type="number"
                            placeholder="10"
                            value={exercise.target_reps || ""}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                exerciseIndex,
                                "target_reps",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #cbd5e1",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                            min="1"
                            required
                          />
                        </div>

                        {/* Rest Input Box */}
                        <div style={{ flex: 1.5, minWidth: "95px" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#64748b",
                              marginBottom: "4px",
                              textAlign: "center",
                            }}
                          >
                            Rest (sec)
                          </label>
                          <input
                            type="number"
                            placeholder="90"
                            value={exercise.target_rest || ""}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                exerciseIndex,
                                "target_rest",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #cbd5e1",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                            min="0"
                          />
                        </div>

                        {/* Remove Row Button */}
                        <div style={{ paddingBottom: "4px" }}>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExercise(index, exerciseIndex)
                            } // --> Here it is
                            style={{
                              backgroundColor: "transparent",
                              color: "#dc3545",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "bold",
                              padding: "8px",
                              fontSize: "16px",
                            }}
                            title="Remove exercise"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "15px",
                      border: "1px dashed #cbd5e1",
                      borderRadius: "4px",
                      backgroundColor: "#ffffff",
                      marginBottom: "15px",
                    }}
                  >
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}
                    >
                      No exercises added yet. Click below to add your first
                      movement!
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleAddExercise(index)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  + Add Exercise row
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form Action Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={handleAddWorkout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            + Add Training Day
          </button>

          <button
            type="submit"
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Save Program Blueprint
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProgramPage;
