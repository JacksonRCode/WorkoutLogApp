import { config } from "../config";
const { Pool, types } = require("pg");

/*
 * PSQL interprets NUMERIC types as strings.
 * 1700 is the Object identifier (OID) for PSQL's NUMERIC type.
 * This is converting all NUMERIC types from strings to floats (unless null).
 */
const NUMERIC_OID = 1700;
types.setTypeParser(NUMERIC_OID, (value) => {
  return value === null ? null : parseFloat(value);
});

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.name,
  password: config.database.password,
  port: config.database.port,
});

module.exports = pool;
