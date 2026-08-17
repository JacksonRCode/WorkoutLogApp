import path from "path";
import dotenv from "dotenv";

type JwtExpiration = `${number}${"s" | "m" | "h" | "d"}`;
type Environment = "development" | "test" | "production";
type AppConfig = {
  readonly env: Environment;
  readonly server: {
    readonly port: number;
    readonly environment: Environment;
  };
  readonly database: {
    readonly host: string;
    readonly port: number;
    readonly name: string;
    readonly user: string;
    readonly password: string;
  };
  readonly auth: {
    readonly jwtSecret: string;
    readonly jwtExpiresIn: JwtExpiration;
    readonly jwtIssuer: string;
    readonly jwtAudience: string;
  };
  readonly client: {
    readonly url: string;
  };
};

const envCheck = process.env.NODE_ENV ?? "development";

// Load env variables depending on runtime environment
if (
  envCheck !== "development" &&
  envCheck !== "test" &&
  envCheck !== "production"
) {
  throw new Error(`Invalid NODE_ENV: ${envCheck}`);
}

const env: Environment = envCheck;

if (env === "development") {
  dotenv.config({
    path: path.join(__dirname, "../.env"),
  });
} else if (env === "test") {
  dotenv.config({
    path: path.join(__dirname, "../.env.test"),
  });
} else {
  // Don't load anything in production
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateJwtExp(jwtExp: string | undefined) {
  const value = jwtExp ?? "24h";

  const re = /^[1-9]\d*[smhd]$/;
  if (!re.test(value)) {
    throw new Error(`Invalid JWT expiration value: ${value}`);
  }

  return value as JwtExpiration;
}

// Create config object
const config: AppConfig = {
  env,
  server: {
    port: Number(process.env.PORT) || 3000,
    environment: env,
  },
  database: {
    host: getRequiredEnv("DB_HOST"),
    port: Number(process.env.DB_PORT) || 5432,
    name: getRequiredEnv("DB_DATABASE"),
    user: getRequiredEnv("DB_USERNAME"),
    password: getRequiredEnv("DB_PASSWORD"),
  },
  auth: {
    jwtSecret: getRequiredEnv("JWT_SECRET"),
    jwtExpiresIn: validateJwtExp(process.env.JWT_EXPIRES_IN),
    jwtIssuer: getRequiredEnv("JWT_ISSUER"),
    jwtAudience: getRequiredEnv("JWT_AUDIENCE"),
  },
  client: {
    url: process.env.CLIENT_URL || "http://localhost:5173",
  },
};

Object.freeze(config);
export { config };
