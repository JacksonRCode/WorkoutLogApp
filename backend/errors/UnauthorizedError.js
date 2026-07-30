// 401 - Invalid email or password --> unauthorized
const { AppError } = require("./AppError");

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized resource") {
    super(message, 401);
  }
}

module.exports = UnauthorizedError;
