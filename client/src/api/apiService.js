// apiService.js
const URL = "http://localhost:3000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// /*
//  * When a protected request return 401, clear the stored authentication and
//  * redirect the user.
//  */
// const handleUnauthorized = async () => {
//   localStorage.removeItem("token");
//   // TODO
// };

const handleResponse = async (response, defaultMessage) => {
  if (response.status == 401) {
    // 401 = unauthorized
    localStorage.removeItem("token");
    window.location.reload();
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || defaultMessage);
  }
  return response;
};

export const apiService = {
  signUp: async (f_name, l_name, email, password) => {
    const response = await fetch(`${URL}/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ f_name, l_name, email, password }),
    });

    await handleResponse(response, "Sign up failed");

    return await response.json();
  },
  login: async (email, password) => {
    const response = await fetch(`${URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    await handleResponse(response, "Login failed");

    return await response.json();
  },
  createProgram: async (programData) => {
    const response = await fetch(`${URL}/programs/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(programData),
    });
    await handleResponse(response, "Program creation failed (apiService.js)");

    return await response.json();
  },
  createWorkout: async ({ name, notes }) => {
    const response = await fetch(`${URL}/workouts/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, notes }),
    });
    await handleResponse(response, "Program creation failed");

    return await response.json();
  },
  getPrograms: async () => {
    const response = await fetch(`${URL}/programs`, {
      method: "GET",
      headers: getHeaders(),
    });
    await handleResponse(response, "Program retrieval failed");

    return await response.json();
  },
  getWorkouts: async (programId) => {
    const response = await fetch(`${URL}/programs/${programId}/workouts`, {
      method: "GET",
      headers: getHeaders(),
    });
    await handleResponse(response, "Program workouts retrieval failed");

    return await response.json();
  },
  getWorkoutExercises: async (programId, workoutId) => {
    const response = await fetch(
      `${URL}/programs/${programId}/workouts/${workoutId}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );
    await handleResponse(response, "Workout exercise retrieval failed");

    return await response.json();
  },
  removeWorkout: async (programId, workoutId) => {
    const response = await fetch(
      `${URL}/programs/${programId}/workouts/${workoutId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
    );
    await handleResponse(response, "Workout deletion failed");

    return await response.json();
  },
  removeProgram: async (programId) => {
    const response = await fetch(`${URL}/programs/${programId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    await handleResponse(response, "Program deletion failed");

    return await response.json();
  },
  getMe: async () => {
    console.log(`${URL}/user/me`);
    const response = await fetch(`${URL}/user/me`, {
      method: "GET",
      headers: getHeaders(),
    });
    // console.log(response);
    await handleResponse(response, "Get me failed");

    return await response.json();
  },
};
