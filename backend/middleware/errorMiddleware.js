const AppError = require("../errors/AppError");

const handleError = (err, req, res, next) => {
  if (err instanceof AppError) {
    const response = {
      message: err.message,
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};

module.exports = handleError;
