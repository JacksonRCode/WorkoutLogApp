-- db/init.sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  f_name VARCHAR(50) NOT NULL,
  l_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
  program_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  CONSTRAINT UQ_ProgramName UNIQUE (name, user_id),
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE workouts (
  workout_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE program_workouts (
  program_id INT,
  workout_id INT,
  PRIMARY KEY (program_id, workout_id),
  FOREIGN KEY (program_id) REFERENCES programs (program_id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts (workout_id) ON DELETE CASCADE
);

CREATE TABLE exercises (
  exercise_id SERIAL PRIMARY KEY,
  user_id INT,
  name VARCHAR(50) NOT NULL,
  muscle_group VARCHAR(50),
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE workout_exercises (
  PRIMARY KEY (workout_id, exercise_id),
  workout_id INT,
  exercise_id INT,
  order_index INT,
  target_sets INT,
  target_reps INT,
  target_weight NUMERIC(6, 2),
  target_duration INT,
  rest INT,
  time_flag BOOLEAN DEFAULT FALSE,
  distance NUMERIC(6, 2),
  notes TEXT,
  FOREIGN KEY (workout_id) REFERENCES workouts (workout_id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises (exercise_id) ON DELETE CASCADE
);

CREATE TABLE workout_completed (
  workout_completed_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  workout_id INT,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts (workout_id) ON DELETE SET NULL
);

CREATE TABLE completed_exercises (
  completed_exercise_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  workout_completed_ID INT NOT NULL,
  time_flag BOOLEAN,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises (exercise_id) ON DELETE CASCADE,
  FOREIGN KEY (workout_completed_id) REFERENCES workout_completed (workout_completed_id) ON DELETE CASCADE
);

CREATE TABLE completed_sets (
  completed_set_id SERIAL PRIMARY KEY,
  completed_exercise_id INT NOT NULL,
  weight NUMERIC(6, 2),
  reps INT,
  distance NUMERIC(6, 2),
  duration INT,
  rpe NUMERIC(3, 1),
  set_number INT NOT NULL,
  FOREIGN KEY (completed_exercise_id) REFERENCES completed_exercises (completed_exercise_id) ON DELETE CASCADE
);

CREATE TABLE user_exercise_stats (
  PRIMARY KEY (user_id, exercise_id),
  user_id INT,
  exercise_id INT,
  calculated_max NUMERIC(6, 2),
  date_last_hit TIMESTAMP,
  all_time_best NUMERIC(6, 2),
  best_time INT,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises (exercise_id) ON DELETE CASCADE
);
