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
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE workouts (
    workout_id SERIAL PRIMARY KEY,
    user_id INT,
    program_id INT,
    name VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (program_id) REFERENCES programs(program_id)
);

CREATE TABLE exercises (
    exercise_id SERIAL PRIMARY KEY
);

CREATE TABLE workout_exercises (
    order_index INT
);

CREATE TABLE workout_completed (
    workout_completed_id SERIAL PRIMARY KEY
);

CREATE TABLE completed_exercises (
    completed_exercise_id SERIAL PRIMARY KEY
);

CREATE TABLE completed_sets (
    completed_set_id SERIAL PRIMARY KEY
);

CREATE TABLE user_exercise_stats (
    calculated_max INT
);
