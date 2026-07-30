// 409 - Request conflicts with existing state
const { AppError } = require("./AppError");

class ConflictError extends AppError {
  constructor(message = "Conflict with existing state") {
    super(message, 409);
  }
}

module.exports = ConflictError;
